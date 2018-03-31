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

/**
 * with the functions need to be called by transaction functions
 */

 /**
  * to generate the GUID for keys
  * 
  */
 function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
function getNS() {
  var NS_M = 'com.acob.promiseme';
  return NS_M;
}
function Constants() {
return {
  'NS_M':'com.acob.promiseme',
  'P_COUPLE':'Couple',
  'A_PROMISEME':'PromiseMe',
  'A_PROMISE_STATUS':'PromiseStatus',
  'A_VOUCHER':'Voucher',
  'A_VOUCHERNEW':'VoucherNew',
  'A_VOUCHERCHANGE':'VoucherChange',
  'A_VOUCHERINSTANCE':'VoucherInstance',
  'A_VOUCHERINSTANCENEW':'VoucherInstanceNew',
  'A_VOUCHERINSTANCECHANGE':'VoucherInstanceChange',
  'PT_INITIATOR':'Initiator',
  'PT_PROMISER':'Promiser',
  'PT_BENEFICIENT':'Beneficient',
  'PT_OWNER':'Owner'

}

}
var PROMISE_RESULT = 
{
"GOOD":"GOOD",
"BAD":"BAD",
"PASS":"PASS"
}

function ConstPromiseStatus() {
return {
  "NEW":
  {"value":"NEW",
  "previousStatus":["NEW"]
  },
  "NEGOTIATING":
  {"value":"NEGOTIATING",
  "previousStatus":["NEW","NEGOTIATING"]
  },
  "REJECT":
  {"value":"REJECT",
  "previousStatus":["NEW","NEGOTIATING"]
  },
 
  "FULFILLING":
  {"value":"FULFILLING",
  "previousStatus":["NEW","NEGOTIATING"]
  },
  "COMPLETED":
  {"value":"COMPLETED",
  "previousStatus":["FULFILLING"]
  },
  "CLOSED":
  {"value":"CLOSED",
  "previousStatus":["COMPLETED"]
  },

  "CANCELLED":
  {"value":"CANCELLED",
  "previousStatus":["NEW","NEGOTIATING","FULFILLING"]
  }
}
}
function defaultDate() {
//return the intial date on 1970-01-01T00:00:00.000Z
return new Date(0);
}

function ConstErrors(){

return {
    "1001":{
      "code":"1001",
      "msg":"Cannot find the paticipant"
    },
    "3001":{
      "code":"3001",
      "msg":"Promise From ID not matched"
    },
    "3002":{
      "code":"3002",
      "msg":"Promise To ID not matched"
    },
    "3003":{
      "code":"3003",
      "msg":"current User cannot do the action. "
    },
    "4001":{
      "code":"4001",
      "msg":"Status not match"
    },
    "4010":{
      "code":"4010",
      "msg":"Promise cannot be terminated per status "
    },
    "5001":{
      "code":"5001",
      "msg":"Not a valid promise result"
    },
};

}
function err(code){
  var e = ConstErrors()[code]
  if (e){
    return e.code + ": "+e.msg
  } else {
    "Cannot find the error with code " + code
  }
}

//get verify person by different scenario 

function getVerifyPerson(promiseHeader,newStatus) {
var promiser = promiseHeader.promiser.getIdentifier();
var beneficent = promiseHeader.beneficent.getIdentifier();
var initiator = promiseHeader.initiator.getIdentifier();
var STATUS = PromiseStatus()
var sc = 0;
if (beneficent == initiator){
    sc = 1;
}
if (promiser == initiator){
  sc = 2;
}
if (sc == 1){
  switch (newStatus) {
    case STATUS.CONFIRMING.value:
      return beneficent;
    case STATUS.CONFIRMED.value:
      return promiser;
    case STATUS.REJECT.value:
      return promiser;
    case STATUS.DONE.value:
      return promiser;
  }
}
if (sc == 2){
  switch (newStatus) {
    case STATUS.CONFIRMING.value:
      return promiser;
    case STATUS.CONFIRMED.value:
      return beneficent;
    case STATUS.REJECT.value:
      return beneficent;
  }
}
return null ;


}
//test if object is included in array
function include(arr,obj) {
return (arr.indexOf(obj) != -1);
}
// get next process person's ID
function getNextId(pmStatus){
var STATUS = ConstPromiseStatus()
switch (pmStatus.status) {
  case STATUS.NEW.value:
  case STATUS.NEGOTIATING.value  :
  case STATUS.CANCELLED.value:    
    if (pmStatus.currentId == pmStatus.promiseFromId){
        return pmStatus.promiseToId;
    } else {
       return pmStatus.promiseFromId;
    }
  case STATUS.FULFILLING.value:
    return   pmStatus.promiseFromId;
  case STATUS.COMPLETED.value:
  case STATUS.CLOSED.value:    
    return   pmStatus.promiseToId;
  case STATUS.REJECT.value:    
    return   pmStatus.promiseToId;

  
}

}
