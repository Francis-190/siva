using { billing_Simplification.db as new } from '../db/schema';


service MyService {

    entity Billings as projection on new.Billings;

    entity Dealer as projection on new.Dealer;

}