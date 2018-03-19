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
        })
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