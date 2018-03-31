/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Couple 2 person
 * highest bid that is over the asking price
 * @param {com.acob.promiseme.Together} txTogether 
 * @transaction
 */
function together(txTogether) {
    
    var CONSTANTS = Constants();
    // Get the factory.
    var factory = getFactory();
  console.log(factory);

var partner1 = txTogether.partner1
var partner2 = txTogether.partner2
    //make them coupled
    partner1.partner = partner2
    partner2.partner = partner1

    return getParticipantRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.P_COUPLE)
    .then(function(userRegistry) {
        // save the buyer        
            return userRegistry.updateAll([partner1,partner2]);
        
    });
}

/**
 * Create a voucher
 * @param {com.acob.promiseme.createVoucherNew} txVoucher
 * @transaction
 */
 function createVoucherNew(txVoucher){
   var factory = getFactory();
    var CONSTANTS = Constants();
   var voucherId = guid();
   var voucherNew = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHERNEW,voucherId);
   var voucher = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHER,voucherId);
   voucherNew.startingStatus = txVoucher.startingStatus;
   voucherNew.brief = txVoucher.brief;
   voucherNew.bonus = txVoucher.bonus;
   voucherNew.loveRate = txVoucher.loveRate;
   voucherNew.voucherType = "NEW";
   voucher.voucherType = "NEW";
    return getAssetRegistry(voucherNew.getFullyQualifiedType())
    .then(function (registry) {
        return registry.add(voucherNew);
    })
    .then(function(){
    return getAssetRegistry(voucher.getFullyQualifiedType())
    .then(function (registry) {
        return registry.add(voucher);
    })
  })
 }


/**
 * Create a voucher
 * @param {com.acob.promiseme.createVoucherChange} txVoucher
 * @transaction
 */
 function createVoucherChange(txVoucher){
   var factory = getFactory();
    var CONSTANTS = Constants();
   var voucherId = guid();
   var voucherChange = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHERCHANGE,voucherId);
    var voucher = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHER,voucherId);
   voucherChange.status = txVoucher.status;
   voucherChange.brief = txVoucher.brief;
   voucherChange.bonus = txVoucher.bonus;
   voucherChange.extensionDays = txVoucher.extensionDays;
   voucherChange.voucherType = "CHANGE";
   voucher.voucherType = "CHANGE";
    return getAssetRegistry(voucherChange.getFullyQualifiedType())
    .then(function (registry) {
        return registry.add(voucherChange);
    })
      .then(function(){
    return getAssetRegistry(voucher.getFullyQualifiedType())
    .then(function (registry) {
        return registry.add(voucher);
    })
    })
 }

/**
 * buy a voucher
 * @param {com.acob.promiseme.buyVoucher} txVoucherInstance
 * @transaction
 */
 function buyVoucher(txVoucherInstance){
    var factory = getFactory();
    var CONSTANTS = Constants();
    var voucherInstanceId = guid(); 
    var t = new Date().valueOf()+86400000*10;
    var useTime = new Date(t);
    var voucherInstance = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHERINSTANCE,voucherInstanceId);
    var voucherInstanceNew = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHERINSTANCENEW,voucherInstanceId);
    var voucherInstanceChange = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_VOUCHERINSTANCECHANGE,voucherInstanceId);
   debugger;
    return getAssetRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.A_VOUCHER)
    
    .then(function(assetRegistry) {  
        var voucher
        return assetRegistry.get(txVoucherInstance.voucherId)
      
        .then (function(voucherBought){
            voucher = voucherBought; 
            voucherInstance.ownerId = txVoucherInstance.ownerId;
            voucherInstance.voucherStatus = "UNUSED";
            voucherInstance.voucherType = voucher.voucherType;
            voucherInstance.expiryDate = useTime;
            if (voucher.voucherType == "NEW"){
            
            return getAssetRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.A_VOUCHERNEW)
                .then(function(assetRegistry) {  
                var voucherNew
                return assetRegistry.get(txVoucherInstance.voucherId)
                 .then (function(voucherNewBought){
                 voucherNew = voucherNewBought; 
                 voucherInstanceNew.startingStatus = voucherNew.startingStatus;
                 voucherInstanceNew.brief = voucherNew.brief;
                 voucherInstanceNew.bonus = voucherNew.bonus;
                 voucherInstanceNew.loveRate = voucherNew.loveRate;             
                 voucherInstanceNew.expiryDate = useTime;
                 voucherInstanceNew.ownerId = txVoucherInstance.ownerId;
                 voucherInstanceNew.voucherStatus = "UNUSED";
                 voucherInstanceNew.voucherType = voucher.voucherType
                    return getParticipantRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.P_COUPLE)
                    .then(function(participantRegistry){
                    var Owner
                         return participantRegistry.get(txVoucherInstance.ownerId)
                         .then (function(people){
                         Owner = people;
          
   
                            if (Owner.balance<voucherInstanceNew.bonus) {
                            throw new Error ("not enough bonus");
                            }
                            else{
 
                               return getAssetRegistry(voucherInstance.getFullyQualifiedType())
                               .then(function (registry) {
                               return registry.add(voucherInstance);
                                })
                               .then(function(){
                               Owner.balance -= voucherInstanceNew.bonus;
                                return participantRegistry.update(Owner);
                               })
                               .then(function(){
                                 return getAssetRegistry(voucherInstanceNew.getFullyQualifiedType())
                               .then(function (registry) {
                               return registry.add(voucherInstanceNew);
                                })
                               })
                             } 
                          }) 
                       })
                })
               })
            }
            if (voucher.voucherType == "CHANGE"){
            return getAssetRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.A_VOUCHERCHANGE)
                .then(function(assetRegistry) {  
                var voucherChange
                return assetRegistry.get(txVoucherInstance.voucherId)
                 .then (function(voucherChangeBought){
                 voucherChange = voucherChangeBought; 
                 voucherInstanceChange.status = voucherChange.status;
                 voucherInstanceChange.brief = voucherChange.brief;
                 voucherInstanceChange.extensionDays = voucherChange.extensionDays;             
                 voucherInstanceChange.ownerId = txVoucherInstance.ownerId;
                 voucherInstanceChange.voucherStatus = "UNUSED";
                 voucherInstanceChange.voucherType = voucher.voucherType
                 voucherInstanceChange.bonus = voucherChange.bonus;
                 voucherInstanceChange.expiryDate = useTime; 
                    return getParticipantRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.P_COUPLE)
                    .then(function(participantRegistry){
                    var Owner
                         return participantRegistry.get(txVoucherInstance.ownerId)
                         .then (function(people){
                         Owner = people;
          
   
                            if (Owner.balance<voucherInstanceChange.bonus) {
                            throw new Error ("not enough bonus");
                            }
                            else{
 
                               return getAssetRegistry(voucherInstance.getFullyQualifiedType())
                               .then(function (registry) {
                               return registry.add(voucherInstance);
                                })
                               .then(function(){
                               Owner.balance -= voucherInstanceChange.bonus;
                                return participantRegistry.update(Owner);
                               })
                               .then(function(){
                                 return getAssetRegistry(voucherInstanceChange.getFullyQualifiedType())
                               .then(function (registry) {
                               return registry.add(voucherInstanceChange);
                                  })
                               })
                             } 
                          }) 
                       })
                })
               }) 
            }
        })   
    })
 }

 /**
 * use a voucher
 * @param {com.acob.promiseme.useVoucher} txVoucherInstancer
 * @transaction
 */
  function useVoucher(txVoucherInstance) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();
    var promiseId = guid()
    var useTime = new Date();
    var promise = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISEME,promiseId);

  
    return getAssetRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.A_VOUCHERINSTANCE)
    .then(function(assetRegistry) {  
    var voucherInstance
    return assetRegistry.get(txVoucherInstance.voucherInstanceId)

       .then(function(voucherUsed){
       if (voucherUsed.voucherType =="NEW"){
         
         
          return getParticipantRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.P_COUPLE)
          .then(function(participantRegistry){
          var Owner
          return participantRegistry.get(txVoucherInstance.ownerId)
             .then (function(people){
             Owner = people;
       
             var promiseFrom = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, Owner.partner.getIdentifier());
             var promiseTo = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, Owner.personId);
             var creator = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, Owner.personId); 
             return getAssetRegistry(CONSTANTS.NS_M + '.' + CONSTANTS.A_VOUCHERINSTANCENEW)
            .then(function(voucherInstanceNewRegistry){
               return voucherInstanceNewRegistry.get(txVoucherInstance.voucherInstanceId)
               .then(function(voucherInstanceNew){
                promise.promiseFrom = promiseFrom;
                promise.promiseTo = promiseTo;
                promise.creator = creator;
                promise.brief = voucherInstanceNew.brief;
                promise.expectation = txVoucherInstance.expectation
                promise.deadline = txVoucherInstance.deadline;
                promise.bonus = 0;
                promise.loveRate = voucherInstanceNew.loveRate
                promise.implementTime = defaultDate();
                promise.result = ""
                // set promise status 
                var promiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,promiseId);

                promiseStatus.promiseFromId = Owner.partner.getIdentifier();
                promiseStatus.promiseToId = voucherUsed.ownerId;
                promiseStatus.creatorId = voucherUsed.ownerId;
                promiseStatus.currentId = voucherUsed.ownerId;
                promiseStatus.status = voucherInstanceNew.startingStatus;
                promiseStatus.preStatus = STATUS.NEW.value;
                promiseStatus.nextId = getNextId(promiseStatus);

                // save the promise
   
                   if (voucherUsed.voucherStatus=="USED") {
                   throw new Error ("voucher already used");
                   }
                   if (voucherInstanceNew.expiryDate < useTime){
                   throw new Error ("voucher expired");
                   }
                   else{
                   return getAssetRegistry(promise.getFullyQualifiedType())
                      .then(function (registry) {
                      return registry.add(promise)
                         .then (function (){
                         return getAssetRegistry(promiseStatus.getFullyQualifiedType())
                             .then (function(statusReg){
                             return statusReg.add(promiseStatus);
                             })
                             .then(function(){
                             voucherUsed.voucherStatus = "USED";
                             return assetRegistry.update(voucherUsed);
                             })
                             .then(function(){
                             voucherInstanceNew.voucherStatus = "USED";
                             return voucherInstanceNewRegistry.update(voucherInstanceNew);
                             })
                         });
                      });
       
                     }    
                 });
                 })
                })
              });
       }
       if (voucherUsed.voucherType =="CHANGE"){
        return getAssetRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.A_PROMISEME) 
        .then (function(promiseRegistry){
          return promiseRegistry.get(txVoucherInstance.promiseId)
          .then (function(promise){
            return getAssetRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.A_PROMISE_STATUS)
            .then (function(promiseStatusRegistry){
              return promiseStatusRegistry.get(txVoucherInstance.promiseId)
              .then (function(promiseStatus){
              return getAssetRegistry(CONSTANTS.NS_M + '.' + CONSTANTS.A_VOUCHERINSTANCECHANGE)
                 .then(function(voucherInstanceChangeRegistry){
                  return voucherInstanceChangeRegistry.get(txVoucherInstance.voucherInstanceId)
                   .then(function(voucherInstanceChange){
                if(voucherInstanceChange.status != "NA"){
               promiseStatus.status=voucherInstanceChange.status;
              }
               var d = voucherInstanceChange.extensionDays;
                var t = promise.deadline.valueOf()+86400000*d;
               var newTime = new Date(t);
               promise.deadline = newTime;
                 // save the promise
                
                   if (voucherUsed.voucherStatus=="USED") {
                   throw new Error ("voucher already used");
                   }
                   if (voucherUsed.expiryDate < useTime){
                   throw new Error ("voucher expired");
                   }
                   else{
                   return getAssetRegistry(promise.getFullyQualifiedType())
                      .then(function (registry) {
                      return registry.update(promise)
                         .then (function (){
                         return getAssetRegistry(promiseStatus.getFullyQualifiedType())
                             .then (function(statusReg){
                             return statusReg.update(promiseStatus);
                             })
                             .then(function(){
                             voucherUsed.voucherStatus = "USED";
                             return assetRegistry.update(voucherUsed);
                             })
                             .then(function(){
                             voucherInstanceChange.voucherStatus = "USED";
                             return voucherInstanceChangeRegistry.update(voucherInstanceChange);
                             })
                         });
                      });
                     }    
                  })
                })
             })
            })
          })
        })     
       }
       })
        
   })
   }



/**
 * Make a promise to create a new one
 * @param {com.acob.promiseme.MakePromise} txPromise 
 * @transaction
 */
function makePromise(txPromise) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();
    var promiseId = guid()
    var promise = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISEME,promiseId);
    

    var promiseFrom = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, txPromise.promiseFromId);
    var promiseTo = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, txPromise.promiseToId);
    var creator = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, txPromise.creatorId);

    promise.promiseFrom = promiseFrom;
    promise.promiseTo = promiseTo;
    promise.creator = creator;
    promise.brief = txPromise.brief;
    promise.expectation = txPromise.expectation
    promise.deadline = txPromise.deadline;    
    promise.bonus = txPromise.bonus;
    promise.loveRate = txPromise.loveRate
    promise.implementTime = defaultDate();
    promise.result = ""
    // set promise status 
    var promiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,promiseId);

    promiseStatus.promiseFromId = txPromise.promiseFromId;
    promiseStatus.promiseToId = txPromise.promiseToId;
    promiseStatus.creatorId = txPromise.creatorId;
    promiseStatus.currentId = txPromise.creatorId;
    promiseStatus.status = STATUS.NEW.value;
    promiseStatus.preStatus = STATUS.NEW.value;
    promiseStatus.nextId = getNextId(promiseStatus);

    // save the promise
    return getAssetRegistry(promise.getFullyQualifiedType())
    .then(function (registry) {
        return registry.add(promise)
        .then (function (){
            return getAssetRegistry(promiseStatus.getFullyQualifiedType())
            .then (function(statusReg){
                return statusReg.add(promiseStatus);
            } );
        });
    });
 
}

/**
 * Negotiate promise
 * @param {com.acob.promiseme.NegotiatePromise} tx 
 * @transaction
 */

function negotiatePromise(tx) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();

    var newPromiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,tx.promiseId);

    newPromiseStatus.promiseFromId = tx.promiseFromId;
    newPromiseStatus.promiseToId = tx.promiseToId;
    newPromiseStatus.currentId = tx.currentId;
    newPromiseStatus.status = STATUS.NEGOTIATING.value;   
    return promiseStatusChange(newPromiseStatus)
    .then(function(){
        var newPromise = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISEME,tx.promiseId);
        
        if (tx.brief != ""){
            newPromise.brief = tx.brief ;
        }
        if (tx.expectation != ""){
            newPromise.expectation = tx.expectation;
        }
        if (tx.bonus >0){
            newPromise.bonus = tx.bonus;
        }
        if (tx.loveRate >0 ){
            newPromise.loveRate = tx.loveRate;
        }
        if (tx.deadline > defaultDate()){
            newPromise.deadline = tx.deadline;
        }
        return updatePromise(newPromise)
        
    })
    
}

/**
 * Confirm promise
 * @param {com.acob.promiseme.ConfirmPromise} tx 
 * @transaction
 */

function confirmPromise(tx) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();

    var newPromiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,tx.promiseId);

    newPromiseStatus.promiseFromId = tx.promiseFromId;
    newPromiseStatus.promiseToId = tx.promiseToId;
    newPromiseStatus.currentId = tx.currentId;
    newPromiseStatus.status = STATUS.FULFILLING.value;   
    return promiseStatusChange(newPromiseStatus)
    
}

    /**
 * Confirm promise
 * @param {com.acob.promiseme.TerminatePromise} tx 
 * @transaction
 */

function terminatePromise(tx) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();

    if (tx.newStatus != STATUS.REJECT.value && tx.newStatus != STATUS.CANCELLED.value){
        throw new Error (err("4010") + " " + tx.newStatus)
    }
    var newPromiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,tx.promiseId);

    newPromiseStatus.promiseFromId = tx.promiseFromId;
    newPromiseStatus.promiseToId = tx.promiseToId;
    newPromiseStatus.currentId = tx.currentId;
    newPromiseStatus.status = tx.newStatus   
    return promiseStatusChange(newPromiseStatus)
    
}
/**
 * Fulfill promise
 * @param {com.acob.promiseme.FulfillPromise} tx 
 * @transaction
 */

function fulfillPromise(tx) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();

    var newPromiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,tx.promiseId);

    newPromiseStatus.promiseFromId = tx.promiseFromId;
    newPromiseStatus.promiseToId = tx.promiseToId;
    newPromiseStatus.currentId = tx.currentId;
    newPromiseStatus.status = STATUS.COMPLETED.value;   
    return promiseStatusChange(newPromiseStatus)
    .then(function(){
        var newPromise = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISEME,tx.promiseId);
                   
        if (tx.implementTime > defaultDate()){
            newPromise.implementTime = tx.implementTime;
        }
        return updatePromise(newPromise)
        
    })
}

/**
 * Complete promise with result
 * @param {com.acob.promiseme.CompletePromise} tx 
 * @transaction
 */

function completePromise(tx) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();

    var newPromiseStatus = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISE_STATUS,tx.promiseId);

    newPromiseStatus.promiseFromId = tx.promiseFromId;
    newPromiseStatus.promiseToId = tx.promiseToId;
    newPromiseStatus.currentId = tx.currentId;
    newPromiseStatus.status = STATUS.CLOSED.value;   
    return promiseStatusChange(newPromiseStatus)
    .then(function(){
        var newPromise = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISEME,tx.promiseId);
                   
        if (tx.result!="" && PROMISE_RESULT[tx.result]){
            newPromise.result = tx.result;               
        } else {
            throw new Error(err("5001"));                
        }
        return updatePromise(newPromise);
        
    })
    .then (function(updatedPromise){
        if (updatedPromise.result == PROMISE_RESULT.GOOD || updatedPromise.result == PROMISE_RESULT.PASS ){
            return updateBalance(updatedPromise);
        }
    })
}

/**
 * change status 
 * @param {com.acob.promiseme.promiseStatus} newStatus 
 */
function promiseStatusChange(newStatus){
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();

    var currentPerson = getCurrentParticipant().getIdentifier();
    
    // if (currentPerson != tx.currentId){
    //     throw new Error(err("3003")+" only user "+tx.currentId + " can do the change")
    // }

    var statusRegistry ;
    return getAssetRegistry(CONSTANTS.NS_M + "." + CONSTANTS.A_PROMISE_STATUS)
        .then (function(statusReg){
            statusRegistry = statusReg;
            return statusReg.get(newStatus.promiseId);
        })
        .then (function (currentStatus){
            if (currentStatus.promiseFromId != newStatus.promiseFromId){
                throw new Error(err("3001"));
            }
            if (currentStatus.promiseToId != newStatus.promiseToId){
                throw new Error(err("3002"));
            }
            // check processer

            if (newStatus.status == STATUS.CANCELLED.value){
                //only creator can cancel the promise  
                if (newStatus.currentId != currentStatus.creatorId){
                    throw new Error(err("3003")+" only creator "+currentStatus.creatorId + " can do cancellation");
                }

            }else if (newStatus.status == STATUS.REJECT.value){
                //only promiseFrom can cancel the promise  
                if (newStatus.currentId != currentStatus.promiseFromId){
                    throw new Error(err("3003")+" only promiseFrom Person "+currentStatus.promiseFromId + " can reject");
                }

            } 
            else {
                if (currentStatus.nextId != newStatus.currentId){
                    throw new Error(err("3003")+" only user "+currentStatus.nextId + " can do the change");
                }
            }



            // check previous status list 
            var oldStatusList = STATUS[newStatus.status].previousStatus
            if (!include(oldStatusList,currentStatus.status)){
                throw new Error(err("4001")+ ": status " + currentStatus.status+ " cannot change to "+newStatus.status);
            }
            //start changing 
            
            newStatus.preStatus = currentStatus.status;
            newStatus.creatorId = currentStatus.creatorId;            
            newStatus.nextId = getNextId(newStatus);
            return statusRegistry.update(newStatus);
        });
}
/**
 * Change status 
 * despired
 * @param {com.acob.promiseme.ChangePromiseStatus} tx 
 * @transaction
 */

function changePromiseStatus(tx) {
    var factory = getFactory();
    var CONSTANTS = Constants();
    var STATUS = ConstPromiseStatus();


    var promiseId=tx.promiseId;
    var promise = factory.newResource(CONSTANTS.NS_M, CONSTANTS.A_PROMISEME,promiseId);

    var promiser = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, tx.promiserId);
    var beneficent = factory.newRelationship(CONSTANTS.NS_M, CONSTANTS.P_COUPLE, tx.beneficentId);
    

    promise.promiser = promiser;
    promise.beneficent = beneficent;


    promise.status = tx.newStatus;

    return updatePromise(promise);

}

/**
 * update promise (including status)
 * @param {com.acob.promiseme.PromiseMe} newPromise 
 */
function updatePromise(newPromise){
    var STATUS = ConstPromiseStatus();
    var factory = getFactory();
    var CONSTANT = Constants()
    var NS_M = CONSTANT.NS_M;
    var astPromise = CONSTANT.A_PROMISEME;

    var updatedPromise ; 

    var promiseId=newPromise.promiseId;

    if (promiseId == null || promiseId == "" ){
        throw new Error ("Invalid Promise Id")
    }

    return getAssetRegistry(NS_M + '.'+astPromise)
    .then(function(registry) {
        promiseRegistry = registry;
        return registry.get(promiseId);
        
    })
    .then(function(promiseHeader){
        if (promiseHeader==null) {
            throw new Error ("no such promise");
        }
        
        // check the promiser ID and beneficent ID in tx 
        // if (newPromise.promiser.getIdentifier()!= promiseHeader.promiser.getIdentifier()){
        //     throw new Error ("Promiser is not matched with the name in Promise ");
        // }
        // if (newPromise.beneficent.getIdentifier() != promiseHeader.beneficent.getIdentifier()){
        //     throw new Error ("Beneficent is not matched with the name in Promise ");
        // }   

 
        
        if (newPromise.brief ) {
            promiseHeader.brief = newPromise.brief;
        }
        if (newPromise.expectation ) {
            promiseHeader.expectation = newPromise.expectation;
        }
        if (newPromise.result ) {
            promiseHeader.result = newPromise.result;
        }
        if (newPromise.bonus ) {
            promiseHeader.bonus = newPromise.bonus;
        }
        if (newPromise.loveRate ) {
            promiseHeader.loveRate = newPromise.loveRate;
        }

        //update date
        var day0 = defaultDate()

        if (newPromise.implementTime > day0 ) {
            promiseHeader.implementTime = newPromise.implementTime;
        }
        if (newPromise.deadline && newPromise.deadline >day0){
            promiseHeader.deadline = newPromise.deadline;
        }
        //when complete 
        // if (include ([STATUS.COMPLETE_DONE,STATUS.COMPLETE_WAIVE],newPromise.status )){
        //     updateBalance(promiseHeader);
        // }
        updatedPromise = promiseHeader
        return  promiseRegistry.update(promiseHeader)
        .then (function(){
            return updatedPromise;
        })
    })
}


/**
 * update balance 
 */

function updateBalance(promise) {
    var CONSTANTS = Constants();


    return getParticipantRegistry(CONSTANTS.NS_M + '.'+ CONSTANTS.P_COUPLE)
    .then(function(userRegistry) {  
        var promiseFrom,promiseTo;
        return userRegistry.get(promise.promiseFrom.getIdentifier())
        .then (function(person){
            promiseFrom = person; 
            promiseFrom.balance += promise.bonus;
            promiseFrom.totalLove += promise.loveRate; 
            return Promise.resolve();               
        })
        .then (function(){
            return userRegistry.get(promise.promiseTo.getIdentifier())
        })
        .then (function(person){
            promiseTo = person; 
            promiseTo.totalLove += promise.loveRate; 
            return Promise.resolve();               
        })
        .then (function(){
            if (promiseFrom && promiseTo){
                return userRegistry.updateAll([promiseFrom,promiseTo]);
            } else {
                throw new Error (err("1001"));
            }
        })
        
        
    });

}