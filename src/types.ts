
export type ObjectInterface = { [key: string]: any};

export type IResult = {
    items: Array<ObjectInterface>;
    changes: {
        inserted: number;
        updated: number;
        removed: number;
        unchange: number;
    };
};


export type IEvents = "change" | "insert" | "remove" | "update";

export type ResultInterfaceType = {
    asProxy: () => Object;
    asPromise: () => Promise<IResult>;
    run: Function;
    on: (event: IEvents, callback: (changes: IResult) => any) => void;
};

export type QueryBuilder = {
    limit(max: number): QueryBuilder;
    paging(max: number, page?: number): QueryBuilder;
    include(): QueryBuilder;
    sort(): QueryBuilder;
    asPromise(): Promise<any>;
    on(event: "change" | "insert" | "remove" | "update" | undefined, callback: Function): void;
    asProxy(): Object;
}


export type DatabaseInterface = {
   
    insert: (records: Array<ObjectInterface> | ObjectInterface) => Promise<IResult>;
    formatObjects: (records: Array<ObjectInterface>) => Array<ObjectInterface>;

    filter(query: Object): QueryBuilder;
    get(id: string | number | boolean): Promise<IResult>;
    count(query: Object): ResultInterfaceType;
    records(): Promise<IResult>;
    remove(ids: Array<string | ObjectInterface> | ObjectInterface | string): Promise<IResult>;
    update(formatedRecords: Array<Object> | Object): Promise<IResult>;
    removeAllRecords(): Promise<IResult>;
    /** ===========================//
    //====   Event Listeners   ====//
    /==============================*/
    on(eventType: string, callback: Function, options?: {
        immediateTrigger: boolean;
    }): void;
    onInsert(callback: Function): void;
    onRemove(callback: Function): void;
    onUpdate(callback: Function): void;
    onChange(callback: (rs?: any) => void): void;
}