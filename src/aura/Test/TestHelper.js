({
    getTableData : function(component){
        var action = component.get("c.TestData");
        action.setCallback(this, function(result){
            if(result.getState() === "SUCCESS"){
                var returnValue = result.getReturnValue();
                
                for (var i = 0; i < returnValue.length; i++) {
                    var row = returnValue[i];
                    if (row.Name) row.Name = row.Name
                    
                }
                
                returnValue.forEach(function(record){
                    record.linkName = '/' + record.Apttus_QPApprov__ProposalId__c;
                });
                
                component.set("v.data", returnValue);
                console.log(returnValue);
            }else{
                console.log('Unknown problem, response state: ' + result.getState());
            }
        });
        $A.enqueueAction(action);
        
        component.set('v.columns', [
            {label: 'Record', type: 'button', initialWidth: 135, typeAttributes: { label: 'Detail', name: 'view_details', title: 'Click to View Details'}},
            
        ]);
    },
    
    sortData: function (component, fieldName, sortDirection) {
        var data = component.get("v.data");
        var reverse = sortDirection !== 'asc';
        data.sort(this.sortBy(fieldName, reverse))
        component.set("v.data", data);
    },
    
    sortBy: function (field, reverse, primer) {
        var key = primer ?
            function(x) {return primer(x[field])} :
        	function(x) {return x[field]};
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    },
})