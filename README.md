# SFDC-BitBucketPipeline-Ant
Folder structure to support deployment to SFDC org using ant.

This base version for starting your repository for pushing changes to SFDC org using ant deployment tool.

This folder structure will work for the ant deployment using bitbucket pipeline.  This structure can also be used for manual dpeloyment using ant.

Whenever user commits any item to the corresponding folder, that will be deployed to the org.

In the current package.xml we have used * which ensures no update is requried to packge.xml.

To do selective deployment we have to remove the files from specific folders.

The yaml file is used for configuring bitbucket pipeline. We used custom deployment hence deployment engineer needs to manually trigger deployment.
It can be configured to run automatically when a commit is pushed to a particular branch.

We are storing user name, passwords as environment varriable on Bitbucket.

We can configure multiple pipelines, one for checking deployment, one for running test classes and for deployment.
pipelines:
    custom:
      {Name of the pipeline} : 
        - step:
            deployment: {Name of the environment on Bitbucket}
            name: {Name of the Pipeline}
            script:
                - echo "$SFDC_USERNAME $SFDC_PASS $SFDC_URL"
                - ant -buildfile build/build.xml deployCheckOnly -Dsfdc.username=$SFDC_USERNAME -Dsfdc.password=$SFDC_PASS -Dsfdc.serverurl=$SFDC_URL



Example structure.
pipelines:
    custom:
      00-test-to-SIT : 
        - step:
            deployment: SIT
            name: Test to SIT
            script:
                - echo "$SFDC_USERNAME $SFDC_PASS $SFDC_URL"
                - ant -buildfile build/build.xml deployCheckOnly -Dsfdc.username=$SFDC_USERNAME -Dsfdc.password=$SFDC_PASS -Dsfdc.serverurl=$SFDC_URL
	  00-Deploy-to-SIT : 
        - step:
            deployment: SIT
            name: Deploy to SIT
            script:
                - echo "$SFDC_USERNAME $SFDC_PASS $SFDC_URL"
                - ant -buildfile build/build.xml deploy -Dsfdc.username=$SFDC_USERNAME -Dsfdc.password=$SFDC_PASS -Dsfdc.serverurl=$SFDC_URL
