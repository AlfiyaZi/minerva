minerva.views.AddClusterWidget = minerva.View.extend({
    events: {
        'click .m-cluster-launch-button': 'launchCluster',
        'click #m-add-cluster-add-field': 'addField'
    },

    initialize: function(settings) {
        this.el = settings;
        this.parentView = settings.parentView;
        this.profileId = settings.profileId;

        return this;
    },

    render: function () {
        this.$el.html(girder.templates.addClusterWidget()).girderModal(this);

        return this;
    },

    addField: function (e) {
        $('form.create-cluster-form').append(girder.templates.advancedClusterKeyValueWidget());
    },

    params: function () {
        // Defaults
        var params = {
            type: 'ansible',
            cluster_config: {},
            profile: this.profileId
        };

        // Deep copy
        $.extend(true, params, {
            name: this.$('#m-cluster-name').val(),
            playbook: this.$('#m-cluster-creation-playbook').val(),
            cluster_config: {
                master_instance_type: this.$('#m-cluster-instance-type').val(),
                node_instance_type: this.$('#m-cluster-instance-type').val(),
                node_instance_count: this.$('#m-cluster-instance-count').val(),
                master_instance_ami: this.$('#m-cluster-ami').val(),
                node_instance_ami: this.$('#m-cluster-ami').val(),
                ansible_ssh_user: this.$('#m-cluster-user').val()
            }
        });

        // Extend cluster_config with advanced variables
        var advancedKeyValuePairs = _.zip($('form.create-cluster-form input.cluster-advanced-key'),
                                          $('form.create-cluster-form input.cluster-advanced-value'));

        _.each(advancedKeyValuePairs, function (keyValuePair) {
            var key = $(keyValuePair[0]).val(),
                val = $(keyValuePair[1]).val();

            if (key != '' && val != '') {
                params.cluster_config[key] = val;
            }
        });

        return params;
    },

    launchCluster: function (e) {
        girder.restRequest({
            path: '/clusters',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(this.params())
        }).done(_.bind(function (resp) {
            girder.restRequest({
                path: '/clusters/' + resp._id + '/launch',
                type: 'PUT'
            }).done(_.bind(function (resp) {
                this.parentView.collection.fetch();

                // Hide modal (@todo better way to do this)
                $('.modal-footer a[data-dismiss="modal"]').click();
            }, this));
        }, this));
    }
});
