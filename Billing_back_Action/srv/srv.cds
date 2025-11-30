using { billing as new} from '../db/schema';
 
 
service MyService {
 
    entity Billings as projection on new.Billings;
    entity Dealer as projection on new.Dealer;
   
    function calculateDealerCount() returns String;
 
}