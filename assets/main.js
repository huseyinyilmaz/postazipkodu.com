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
	/*
	 * Create a file url for given key.
	 */
	getFileUrl: function getFileUrl(key){
	    return this.base + key + '.json';
	},
	/*
	 * create an hash tag for given url
	 * usage: postal.getUrlBase(myViewObj);
	 * currentView and base arguments are used
	 * for recursive calls
	 */
	getUrlBase: function(view,currentView,base){
	    if(!currentView){
		currentView = postal.citiesView;
		base = '';
	    }
	    if(view == currentView)
		return base + '/'+ currentView.code + '/';
	    else
		return postal.getUrlBase(view, currentView.subModuleViewObj, base + '/' + currentView.code + '/' + currentView.selected);
	}
    };

    ////////////
    // MODELS //
    ////////////

    postal.BaseModel  = Backbone.Model.extend({});
    postal.BaseCollection = Backbone.Collection.extend({model: postal.BaseModel});

    postal.BaseView = Backbone.View.extend({
	    tagName:'div',

	    initialize:function(options){
		this.baseKey = options.baseKey;
		this.container.html(postal.loadingContent);
		this.collection = new postal.BaseCollection();
		this.collection.url= postal.getFileUrl(this.baseKey);
		
		this.collection.fetch({
		    success:_.bind(function(models,xhr,options){
     			this.container.children().remove();
     			this.container.append(this.el);
			this.render();
			if(!_.isEmpty(this.options.selections))
			    this.select(this.options.selections);
		    }, this),
		    error:_.bind(function(models,xhr,options){
			alert('Server bağlantısında bir problem oluştu.');
		    }, this)
		});

	    },

	    render:function(){
		this.$el.html(postal.templates.listTemplate({collection:this.collection,
							     display:this.display,
							     urlBase: postal.getUrlBase(this)}));
	    },
	    
	    clearSubModules:function(){
		if(this.subModuleViewObj){
		    this.subModuleViewObj.$el.html('');
		    this.subModuleViewObj.clearSubModules();
		}
	    },
	
	    select:function(selections){
		var selected = _.first(selections);
		selections = _.rest(selections);
		if(this.selected != selected){
		    //clear submodules
		    this.clearSubModules();
		    postal.containers.result.html('');

		    this.selected = selected;
		    this.$('li').removeClass('active');
		    this.$('#'+this.selected).addClass('active');
		    this.subModuleViewObj = new this.subModuleView({baseKey:selected,selections:selections});
		}else{
		    //if there is still any selections left call subModules
		    if(!_.isEmpty(selections))
			this.subModuleViewObj.select(selections);
		}
	    }
	});

    postal.ProvidenceView = postal.BaseView.extend({
	display: 'Mahalle/Köy',
	code: 'providence',
	container: postal.containers.providence,

	select: function(selections){
	    var selected = _.first(selections);
	    var providence = this.collection.find(function(e){return e.get('model_id')==selected;});

	    this.$('li').removeClass('active');
	    this.$('#'+ selected).addClass('active');

	    postal.containers.result.html(postal.templates.resultTemplate({location:providence.get('code'),code:providence.get('value')}));

	},
	
	onClick: function(event){
	    var id=event.target.id;
	    var district = this.collection.find(function(e){return e.get('model_id')==id;});
	    this.$('li').removeClass('active');
	    $(event.target).parent().addClass('active');
	    postal.containers.result.html(postal.templates.resultTemplate({location:district.get('code'),code:district.get('value')}));
	}
    });
    
    postal.DistrictView = postal.BaseView.extend({
	display: 'Bölge',
	code: 'district',
	container: postal.containers.district,
	subModuleView: postal.ProvidenceView,
	subModuleContainer: postal.containers.providence
    });
    
    postal.TownshipView = postal.BaseView.extend({
	display: 'İlçe',
	code: 'township',
	container: postal.containers.township,
	subModuleView: postal.DistrictView,
	subModuleContainer: postal.containers.district
    });
    
    postal.CityView = postal.BaseView.extend({
	display: 'Şehir',
	code: 'city',
	container: postal.containers.city,
	subModuleView: postal.TownshipView,
	subModuleContainer: postal.containers.township
    });


    ////////////
    // ROUTER //
    ////////////
    postal.Router = Backbone.Router.extend({
	routes:{
	    '': 'init',
	    '/city/:city': 'set',
	    '/city/:city/township/:township': 'set',
	    '/city/:city/township/:township/district/:district': 'set',
	    '/city/:city/township/:township/district/:district/providence/:providence': 'set'

	},
	init:function(){
	    //clear submodules if necessary
	    if(postal.citiesView)
		postal.citiesView.clearSubModules();
	    //clear results div
	    postal.containers.result.html('');
	    //create a new cities view
	    postal.citiesView = new postal.CityView({baseKey:postal.cities_key});
	},
	set: function(city,township,district,providence){
	    //get selections list
	    var selections = _.filter([city, township, district, providence], function(e){return e;});
	    //if this is first time openning the app create default cities view
	    //if it is not first time,select given selections
	    if(postal.citiesView)
		postal.citiesView.select(selections);
	    else
		postal.citiesView = new postal.CityView({baseKey:postal.cities_key,selections:selections});
	}
    });

    //initialize router
    postal.router = new postal.Router();
    Backbone.history.start();

    
});