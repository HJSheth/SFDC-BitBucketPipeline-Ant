({
	doInit: function(component, event, helper){
        component.set('v.Spinner', false);
        
        var getReport = component.get("c.getPendingProposalsReport");
        getReport.setCallback(this, function(result){
            if(result.getState() === "SUCCESS"){
                var returnVal = result.getReturnValue();
                component.set("v.reportId", returnVal);
                console.log(returnVal);
            }else{
                console.log('Unknown problem, response state: ' + result.getState());
            }
        });
        $A.enqueueAction(getReport);
        
        var action = component.get("c.getPendingApprovals");
        action.setCallback(this, function(result){
            if(result.getState() === "SUCCESS"){
                var returnValue = result.getReturnValue();
                
                for (var i = 0; i < returnValue.length; i++) {
                    var row = returnValue[i];
                    if (row.Apttus_Approval__Initial_Submitter__c) row.SubmitterName = row.Apttus_Approval__Initial_Submitter__r.Name;
                    if (row.Apttus_QPApprov__ProposalId__c) row.RelatedQuote = row.Apttus_QPApprov__ProposalId__r.Name;
                    if (row.Apttus_QPApprov__ProposalId__c) row.RelatedQuoteName = row.Apttus_QPApprov__ProposalId__r.Apttus_Proposal__Proposal_Name__c;
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
            {label : 'Quote ID', fieldName : 'RelatedQuote', type: 'text', sortable: 'true'},
            {label: 'Approval Status', fieldName: 'Apttus_Approval__Approval_Status__c', type: 'text', sortable: 'true'},
            {label : 'Submitter', fieldName : 'SubmitterName', type: 'text', sortable: 'true'},
            {label : 'Start Date', fieldName : 'APTS_QuoteStartDate__c', type: 'date', sortable: 'true'},
            {label : 'End Date', fieldName : 'APTS_QuoteEndDate__c', type: 'date', sortable: 'true'},
            {label : 'Quote Name', fieldName : 'RelatedQuoteName', type: 'text', sortable: 'true'},
            //{label: 'Quote Link', fieldName: 'quoteLink', type: 'url', typeAttributes: {label: { fieldName: 'RelatedQuote' }, target: '_blank'}},
            {label : 'Pending Days', fieldName : 'APTS_Waiting_Days__c', type: 'number', sortable: 'true', cellAttributes: { alignment: 'left' }}
        ]);
    },
    
    handleApprove: function (component, event, helper) {
        console.log('***comment for handle approve: ' + component.get('v.approvalComment'));
        console.log('***handleApprove selectedRecords: ' + JSON.stringify(component.get('v.selectedRecords')));
        var selectedRec = component.get('v.selectedRecords');
        var successCount = 0;
        var errorCount = 0;
        //var selectedPrIdList = [];
        for(var index = 0; index < selectedRec.length; index++){
            console.log('***selectedRec[index].Id: ' + selectedRec[index].Id);
            //selectedPrIdList.push(selectedRec[index].Id);
            
            var approveAction = component.get("c.approveRecord");
            approveAction.setParams({
                'requestId' : selectedRec[index].Id,
                'comment' : component.get('v.approvalComment'),
            });
            
            approveAction.setCallback(this, function(result){
                component.set('v.Spinner', true);
                var returnValue = result.getReturnValue();
                console.log('***returnValue: ' + returnValue);
                if(result.getState() === "SUCCESS" && returnValue === true){
                    successCount++;
                    console.log('***successCount++: ' + successCount);
                }else if(result.getState() === "SUCCESS" && returnValue === false){
                    errorCount++;
                    console.log('***errorCount++: ' + errorCount);
                }
                
                if(selectedRec.length === successCount){
                    component.set('v.Spinner', false);
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({                        
                        message: 'Selected records were approved succesfully',
                        type : 'success'
                    });
                    toastEvent.fire();
                }else if((selectedRec.length === successCount + errorCount) && errorCount > 0){
                    component.set('v.Spinner', false);
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({                        
                        message: 'Selected '+successCount+' records were approved successfully but selected '+errorCount+' records could not approved', //approveAction.getError()[0].message,
                        type : 'warning'
                    });
                    toastEvent.fire();
                    console.log('Unknown problem, response state: ' + result.getState());
                    console.log('ERR:' + result.getError());
                    console.log('ERR2:' + JSON.stringify(result.getError()));
                    console.log('EXC:' + JSON.stringify(result));
                }                                              
            });
            
            $A.enqueueAction(approveAction);
        }
        
        component.set('v.Spinner', true);
        component.set('v.selectedRowsCount', 0);
        helper.getTableData(component);
        component.set('v.selectedRowsId', []);
        component.set('v.selectedRecords', []);
        component.set('v.approvalComment', '');
    },
    
    handleReject: function (component, event, helper) {
        console.log('***comment for handle reject: ' + component.get('v.approvalComment'));
        console.log('***handleReject selectedRecords: ' + JSON.stringify(component.get('v.selectedRecords')));
        var selectedRec = component.get('v.selectedRecords');
        var successCount = 0;
        var errorCount = 0;
        //var selectedPrIdList = [];
        for(var index = 0; index < selectedRec.length; index++){
            console.log('***selectedRec[index].Id: ' + selectedRec[index].Id);
            //selectedPrIdList.push(selectedRec[index].Id);
            
            var rejectAction = component.get("c.rejectRecord");
            rejectAction.setParams({
                'requestId' : selectedRec[index].Id,
                'comment' : component.get('v.approvalComment'),
            });
            
            rejectAction.setCallback(this, function(result){
                component.set('v.Spinner', true);
                var returnValue = result.getReturnValue();
                console.log('***returnValue: ' + returnValue);
                if(result.getState() === "SUCCESS" && returnValue === true){
                    successCount++;
                    console.log('***successCount++: ' + successCount);
                }else if(result.getState() === "SUCCESS" && returnValue === false){
                    errorCount++;
                    console.log('***errorCount++: ' + errorCount);
                }
                
                if(selectedRec.length === successCount){
                    component.set('v.Spinner', false);
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({                        
                        message: 'Selected records were rejected succesfully',
                        type : 'success'
                    });
                    toastEvent.fire();
                }else if((selectedRec.length === successCount + errorCount) && errorCount > 0){
                    component.set('v.Spinner', false);
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({                        
                        message: 'Selected '+successCount+' records were rejected successfully but selected '+errorCount+' records could not rejected', //approveAction.getError()[0].message,
                        type : 'warning'
                    });
                    toastEvent.fire();
                    console.log('Unknown problem, response state: ' + result.getState());
                    console.log('ERR:' + result.getError());
                    console.log('ERR2:' + JSON.stringify(result.getError()));
                    console.log('EXC:' + JSON.stringify(result));
                }                                              
            });
            
            $A.enqueueAction(rejectAction);
        }
        
        component.set('v.Spinner', true);
        component.set('v.selectedRowsCount', 0);
        helper.getTableData(component);
        component.set('v.selectedRowsId', []);
        component.set('v.selectedRecords', []);
        component.set('v.approvalComment', '');
    },
    
    updateSelectedText: function (component, event) {
        var selectedRows = event.getParam('selectedRows');
        component.set('v.selectedRecords', selectedRows);
        console.log('selectedRows:' + JSON.stringify(selectedRows));
        component.set('v.selectedRowsCount', selectedRows.length);
        console.log('v.selectedRowsCount:' + component.get('v.selectedRowsCount'));
    },
    
    updateColumnSorting: function (component, event, helper){
        var fieldName = event.getParam('fieldName');
        var sortDirection = event.getParam('sortDirection');
        component.set("v.sortedBy", fieldName);
        component.set("v.sortedDirection", sortDirection);
        helper.sortData(component, fieldName, sortDirection);
    },
    
    handleCellChange: function (component, event, helper){
        var selectedRowsIdList = [];
        var draftValues = event.getParam('draftValues');
        console.log('***draftValues: ' + JSON.stringify(draftValues));
        var rows = component.get('v.data');
        console.log('***rows: ' + JSON.stringify(rows));
        var selectedRecords = component.get('v.selectedRecords');
        console.log('***selectedRecords: ' + JSON.stringify(selectedRecords));
        for(var index = 0; index < draftValues.length; index++){
            for(var innerIndex = 0; innerIndex < rows.length; innerIndex++){
                console.log('***draftValues[index].id: ' + draftValues[index].id);
                console.log('***rows[innerIndex].Id: ' + rows[innerIndex].Id);
                if(draftValues[index].id === rows[innerIndex].Id){
                    console.log('***inside for and if***');
                    rows[innerIndex].Apttus_Approval__Approver_Comments__c = draftValues[index].Apttus_Approval__Approver_Comments__c;
                    selectedRowsIdList.push(rows[innerIndex].Id);
                    selectedRecords.push(rows[innerIndex]);
                }
            }
        }
        console.log(rows);
        component.set('v.data', rows);
        component.set('v.selectedRecords', selectedRecords);
        component.set('v.selectedRowsId', selectedRowsIdList);
        component.set('v.selectedRowsCount', selectedRowsId.length);
        component.find('Datatable').set('v.draftValues', []);
    },
    
    handleRowAction: function (cmp, event, helper) {
        var row = event.getParam('row');
        console.log('row.Id :' + row.Id);
        $A.createComponent('force:recordView', 
                           {'recordId': row.Id},
                           function(content, status){
                               if (status === "SUCCESS"){
                                   cmp.find('overlayLib').showCustomModal({
                                       header: 'Details',
                                       body: content
                                   })
                               }                               
                           }); 
    },
    
    showSpinner: function(component, event, helper){
        component.set("v.Spinner", true); 
    },
    
    hideSpinner : function(component, event, helper){        
        component.set("v.Spinner", false);
    },
    
    navigateToReport : function(component, event, helper) {
        var reportId = component.get('v.reportId');
        var navToSObjEvt = $A.get("e.force:navigateToSObject");
        navToSObjEvt.setParams({
            recordId: reportId,
            slideDevName: "detail"
        }); 
        navToSObjEvt.fire(); 
    }
})