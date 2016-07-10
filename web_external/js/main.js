$(function () {
    minerva.events.trigger('g:appload.before');
    minerva.mainApp = new minerva.App({
        el: 'body',
        parentView: null
    });
    minerva.events.trigger('g:appload.after');
/*
    var exampleGJ = '{"type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [-77.03238901390978, 38.913188059745586] }, "properties": { "title": "Mapbox DC", "icon": "monument" } }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-122.414, 37.776] }, "properties": { "title": "Mapbox SF", "icon": "harbor" } }] }';

    function sendGJ () {
        console.log('sendGJ');
        var gjObj = {
            'geojson': exampleGJ,
            'name': 'blarg'
        }
        minerva.events.trigger('m:add_external_geojson', gjObj);
    }
    setTimeout(function(){ sendGJ(); }, 5000);
*/
    BSVE.init(function()
    {
        console.log("BSVE.init");
        // in the ready callback function, access to workbench vars are now available.
        var user = BSVE.api.user(), // current logged in user
            authTicket = BSVE.api.authTicket(), // harbinger-auth-ticket
            tenancy = BSVE.api.tenancy(), // logged in user's tenant
            dismissed = false, // used for dismissing modal alert for tagging confirmation
            dataSources = null;
        console.log(user);
        console.log(authTicket);

        /*
         * Create a search submit handler.
         * The provided callback function will be executed when a fed search is performed.
         */
        BSVE.api.search.submit(function(query)
        {
            // query object will include all of the search params including the requestId which can be used to make data requests
            console.log(query);
            pollSearch(query);
        }, true, true, true); // set all 3 flags to true, which will hide the searchbar altogether


        function pollSearch(query)
        {
            console.log('pollSearch');
            console.log(query);
            var stopPolling = false;
            BSVE.api.get('/api/search/result?requestId=' + query.requestId, function(response)
            {
                console.log('response from search result api');
                console.log(response);

                // store available data source types for reference
                if ( !dataSources ) { dataSources = response.availableSourceTypes; }

                for ( var i = dataSources.length - 1; i >= 0; i-- )
                {
                    // check each data source in the result
                    if ( response.sourceTypeResults[dataSources[i]].message == "Successfully processed." )
                    {
                        // it's done so fetch updated geoJSON and remove this data source from list
                        var dataSource = dataSources.splice(i,1);
                        console.log('calling getGeoJSON with datasource ');
                        console.log(dataSource);
                        console.log(query);
                        getGeoJSON(query, dataSource[0]);
                        //stopPolling = true;
                        //console.log('STOP polling');
                    }
                }

                if (dataSources.length && !stopPolling)
                {
                    // continue polling since there are still in progress sources
                    setTimeout(function(){ pollSearch(query); }, 2000);
                }
            });
        }

        function getGeoJSON(query, dataSourceName)
        {
            console.log('getGeoJSON');
            console.log(query);
            BSVE.api.get('/api/search/util/geomap/geojson/' + query.requestId + '/all', function(response)
            {
                console.log('response from getGeoJSON');
                console.log(response);
                var gjObj = {
                    'geojson': response,
                    'name': dataSourceName
                }
                minerva.events.trigger('m:add_external_geojson', gjObj);
            });
        }

        /*
         * create a dossier bar for item tagging
         * The provided callback will be executed when the user clicks on one of the tagging buttons in the dossier bar control.
         */
        BSVE.ui.dossierbar.create(function(status)
        {
            // create item object to save
            var item = {
                dataSource : 'GeoVIZ',
                title : 'GeoVIZ Item',
                sourceDate : BSVE.api.dates.yymmdd(Date.now()),
                itemDetail : {
                    statusIconType: 'Map',
                    Description : '...' // this is where the generated content will go
                }
            };

            BSVE.api.tagItem(item, status, function()
            {
                // item successfully tagged
                if (!dismissed)
                {
                    BSVE.ui.alert('Item was tagged successfully', true, function(val)
                    {
                        if ( val ) dismissed = true;
                    });
                }
            });
        });
    });



});
