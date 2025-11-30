namespace my.orders;

entity Billings {
    key modelCode     : String;
    modelDescription  : String;
    stock             : String;
    availability      : String;
    totalQuantity     : String;
    requestedQuantity : String;
    fundRequired      : String;
    totalAllocation   : String;
    OrderVAlue        : String;
    vectorReq         : String;
    fst               : String;
    black             : String;
    red               : String;
    yellow            : String;
    green             : String;
    rational          : String;
    snopAllocation    : String;
    svopAllocation    : String;
    status            : BillingStatus;
}

type BillingStatus : String enum {
  Approved;
  Pending;
  Rejected;
};