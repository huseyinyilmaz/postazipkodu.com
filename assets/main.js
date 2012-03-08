"use strict";
$(function(){
    //////////////////////
    // CREATE NAMESPACE //
    //////////////////////
    window.postal =  {

	base:'pkinfo/',
	cities_key: 'cities',
	loadingContent: $('#loadingTemplate').html(),

	templates: {
	    listTemplate :_.template($('#listTemplate').html()),
	    resultTemplate:_.template($('#resultTemplate').html())},
    
	containers: {
	    city: $('#cityContainer'),
	    township: $('#townshipContainer'),
	    providence: $('#providenceContainer'),
	    district: $('#districtContainer'),
	    result: $('#resultContainer')},
    
	getFileUrl: function getFileUrl(key){
	    return this.base + key + '.json';
	},

	setClear: function(view){
	    view.setClear();
	    if(view.subModuleViewObj)
		setClear(view.subModuleViewObj);
	}
    
    };

    ////////////
    // MODELS //
    ////////////

    postal.BaseModel  = Backbone.Model.extend({});
    postal.BaseCollection = Backbone.Collection.extend({model: postal.BaseModel});

    postal.BaseView = Backbone.View.extend({
	    tagName:'div',
	    events:{
		'click a': 'onClick'
	    },

	    initialize:function(options){
		this.baseKey = options.baseKey;
		console.log(this.container);
		this.container.html(postal.loadingContent);
		this.collection = new postal.BaseCollection();
		this.collection.url= postal.getFileUrl(this.baseKey);
		
		this.collection.fetch({
		    success:_.bind(function(models,xhr,options){
			console.log('success');
     			this.container.children().remove();
     			this.container.append(this.el);
			this.render();
		    }, this),
		    error:_.bind(function(models,xhr,options){
			console.log('error');
		    }, this)
		});

	    },

	    render:function(){
		this.$el.html(postal.templates.listTemplate({collection:this.collection,display:this.display}));
	    },
	    
	    clearSubModules:function(){
		if(this.subModuleViewObj){
		    this.subModuleViewObj.$el.html('');
		    this.subModuleViewObj.clearSubModules();
		}
	    },
	    onClick: function(event){
		var id=event.target.id;
		this.clearSubModules();
		this.subModuleViewObj = new this.subModuleView({baseKey:id});
		this.$('li').removeClass('active');
		$(event.target).parent().addClass('active');
		//empty results
		postal.containers.result.html('');

	    }
	});

    postal.DistrictView = postal.BaseView.extend({
	display: 'Mahalle/Koy',
	container: postal.containers.district,
	onClick: function(event){
	    var id=event.target.id;
	    var district = this.collection.find(function(e){return e.get('model_id')==id;});
	    this.$('li').removeClass('active');
	    $(event.target).parent().addClass('active');
	    postal.containers.result.html(postal.templates.resultTemplate({location:district.get('code'),code:district.get('value')}));
	}
    });
    
    postal.ProvidenceView = postal.BaseView.extend({
	display: 'Bolge',
	container: postal.containers.providence,
	subModuleView: postal.DistrictView,
	subModuleContainer: postal.containers.district
    });
    
    postal.TownshipView = postal.BaseView.extend({
	display: 'ilce',
	container: postal.containers.township,
	subModuleView: postal.ProvidenceView,
	subModuleContainer: postal.containers.providence
    });
    
    postal.CityView = postal.BaseView.extend({
	display: 'Sehir',
	container: postal.containers.city,
	subModuleView: postal.TownshipView,
	subModuleContainer: postal.containers.township
    });


    postal.citiesView = new postal.CityView({baseKey:'cities'});


    ////////////////
    // INITIALIZE //
    ////////////////
    // $.getJSON(postal.getFileUrl(postal.cities_key),
    // 	      function(data, textStatus, jqXHR){
    // 		  if(textStatus==='success'){
    // 		      postal.cities = new postal.BaseCollection(data);
    // 		      postal.citiesView = new postal.CityView({collection:postal.cities});
    // 		      postal.containers.city.children().remove();
    // 		      postal.containers.city.append(postal.citiesView.el);
    // 		      postal.citiesView.render();
    // 		  }
    // 	      });

    
});