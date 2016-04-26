
#### Setup for NEX/Spark/Romanesco mean_contour_analysis

  1. From the minerva top level dir, install the mean_contour_analysis in your minerva instance

```
$> cd utility
$> python import_analyses.py \
--username user \
--password password \
--port 8080 \
--path /path/to/minerva/analyses/NEX/
```

  Now you should see the mean_contour_analysis in your `Analysis Panel` in minerva.
  
  2. Clone romanesco into the `girder/plugins` directory

```
$> cd /path/to/girder/plugins
$> git clone https://github.com/Kitware/romanesco.git
```

  3. install Romanesco dependencies via pip

```
$> cd /path/to/girder/plugins/romanesco
$> pip install -r requirements.txt
```

  4. Install Spark.  You can install in a local cluster mode, and you'll want a Java 7 jvm.

```
These are taken from the .travis.yml file and may need to be revised.  These are more like guidelines than exact commands to run.

Download spark somewhere reasonable: 
-wget http://psg.mtu.edu/pub/apache/spark/spark-1.3.1/spark-1.3.1-bin-hadoop2.4.tgz
Untar it somewhere
- export SPARK_HOME=$HOME/spark-1.3.1-bin-hadoop2.4
- export SPARK_MASTER_IP=localhost
Run the spark master
- $SPARK_HOME/sbin/start-master.sh
Run the spark slave (you may need to look in the master log to find the spark address to attach to)
- $SPARK_HOME/sbin/start-slave.sh worker1 spark://localhost:7077
```

  5. create and configure Romanesco's `worker.local.cfg` in the same dir as `worker.dist.cfg` with content
  
```
[celery]
app_main=romanesco
broker=mongodb://localhost/romanesco

[romanesco]
# Root dir where temp files for jobs will be written
tmp_root=tmp
# Comma-separated list of plugins to enable
plugins_enabled=spark
# Colon-separated list of additional plugin loading paths
plugin_load_path=
```

  6. start the Romanesco worker

```
$> cd /path/to/girder/plugins/romanesco
$> export SPARK_HOME=$HOME/spark-1.3.1-bin-hadoop2.4
$> python -m romanesco
If things are correct it will output 'Loaded plugin "spark"'
```

  7. grunt at the top level of Girder
  8. refresh your Girder web UI page
  9. enable the Romanesco plugin in the Girder web UI admin page, and restart Girder
  10. configure the Romanesco plugin in Girder to allow user or group or folder access, to make it easy, and not safe for production, you can add your Girder username to the users list.


## Read me
  This document contains information about how to set up and use the mean contour analysis as a demonstration of the minerva, girder, romanesco, spark integration.  Eventually it should be removed along with mean contour analysis.  This is here primarily so that while mean_contour.py is in master there is some kind of documentation for how it works.

## Pre Demo
 - Remove all datasets from backend through girder under minerva/dataset
 - Remove nasanex folder under minerva/s3
 - Remove S3 assetstores
   - Removing NEX-DCP30 asset store will require deleting it from the database.  This is a bug and I have a note to file an issue

```
$> mongo
> use girder;
> db.assetstore.remove({“bucket”: “nasanex”});
```

- Remove all jobs

```
$> mongo
> use girder;
> db.job.remove({})
```

- Create the NASA DEMO dataset
   - Open minerva (http://localhost:8080) 
   - Log in and go to the NASA DEMO session
       - username: kotfic
       - password:  letmein
   - Click add dataset
   - select s3 bucket,  click add dataset
   - Fill in the following:
     - name: NASA DEMO
     - s3 bucket: nasanex
     - prefix: CMIP5/CommonGrid/gfdl-esm2g/rcp45/mon/r1i1p1/pr
     - All other are left empty
     - check read only
   - Refresh the page if completed import doesn’t show up immediately

   - Return to session page (click globe icon)  - START FROM HERE



## Add S3 Dataset
 - Click on the ‘mean contour’ analysis
 - Input dataset is prefilled with datasets that have items which are selected
 - Currently parameter field requires manual input of the variable name in the netCDF file
 - Enter ‘pr’ in the parameter field
 - Click Run
   - *Mean contour job should show up in the Jobs panel*
 - Click on mean contour job
   - *job status is available,  including log output*
   - Behind the spinning wheel a local job has been dispatched to our workflow tool Romanesco
   - Romanesco defines tasks, input and output formats, and other metadata for analyses
   - Romanesco uses celery to do asynchronous task scheduling
   - Tasks can be chained together into workflows which can provide data provenance.   
   - Tasks can be Written in Python,  R, or run arbitrary scripts inside of docker containers.
   - Can also set up a spark context and provide it to a task
   - Like this tasks can leverage a spark cluster to do large scale parallel computations
 - *Once mean contour is complete ‘regridded_...’  dataset should be created in dataset panel*
 - Click on arrow next to ‘regridded’  dataset
 - Clicking on it puts it on the session layer panel and renders the contour layer to the map


