namespace billing_Simplification.db;


entity Billings  {
    key modelCode :UUID;
    modelDescription:String;
    stock:String;
    availability:String;
    totalQuantity:String;
    fundRequired:String;
    totalAllocation:String;
    OrderVAlue:String;
    dealer: Association to Dealer;
    vectorReq:String;
    fst:String;
    black:String;
    red:String;
    yellow:String;
    green:String;
    rational:String;
    snopAllocation:String;
    svopAllocation:String;
    
}

entity Dealer {
    key dealerId     : UUID;
    billings : Association to many Billings on billings.dealer=$self;
    DealerName: String;
    Stock_Availability: Integer;
    Limit_available: Integer;
    
}