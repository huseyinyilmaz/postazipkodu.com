window.base = 'pkinfo/';
window.cities_key = 'cities';

window.templates = {
    listTemplate :_.template($('#listTemplate').html()),
    resultTemplate:_.template($('#resultTemplate').html())
};

window.loadingContent = $('#loadingTemplate').html();

window.containers = {
    city: $('#cityContainer'),
    county: $('#countyContainer'),
    district: $('#districtContainer'),
    providence: $('#providenceContainer'),
    result: $('#resultContainer')
};
///////////
// UTILS //
///////////
/*
 * Gets key for file name creation and return file url
 */
function getFileUrl(key){
    return base + key + '.json';
};

function setClear(view){
    view.setClear();
    if(view.subModuleViewObj)
	setClear(view.subModuleViewObj);
}

////////////
// MODELS //
////////////

BaseModel  = Backbone.Model.extend({});
BaseCollection = Backbone.Collection.extend({model:BaseModel});
BaseView = Backbone.View.extend(
{
    tagName:'div',
    events:{
	'click a': 'onClick'
    },
    render:function(){
	this.$el.html(templates.listTemplate({collection:this.collection}));
    },
    setLoading:function(){
	this.$el.html(loadingContent);
    },
    clearSubModules:function(){
	if(this.subModuleViewObj){
	    this.subModuleViewObj.$el.html('');
	    this.subModuleViewObj.clearSubModules();
	}
    },
    onClick: function(event){
	var id=event.target.id;
	this.subModuleContainer.html(loadingContent);
	this.subModuleViewObj && this.subModuleViewObj.clearSubModules();
	containers.result.html('');
	$.getJSON(getFileUrl(id),
		  _.bind(function(data, textStatus, jqXHR){
		      if(textStatus==='success'){
			  this.subModuleCollectionObj = new BaseCollection(data);
			  this.subModuleViewObj = new this.subModuleView(
			      {collection:this.subModuleCollectionObj});
			  this.subModuleContainer.children().remove();
			  this.subModuleContainer.append(this.subModuleViewObj.el);		      
			  this.subModuleViewObj.render();
		      }
		  },this));//getJSON
    },
});

ProvidenceView = BaseView.extend({
    onClick:function(event){
	var id=event.target.id;
	var providence = this.collection.find(function(e){return e.get('model_id')==id;});
	containers.result.html(templates.resultTemplate({location:providence.get('code'),code:providence.get('value')}));
    }
});

DistrictView = BaseView.extend({
    subModuleView:ProvidenceView,
    subModuleContainer: window.containers.providence
});

CountyView = BaseView.extend({
    subModuleView:DistrictView,
    subModuleContainer: window.containers.district,
});

CityView = BaseView.extend({
    subModuleView:CountyView,
    subModuleContainer: window.containers.county,
});

function init(){
    containers.city.html(loadingContent);
    $.getJSON(getFileUrl(cities_key),
	      function(data, textStatus, jqXHR){
		  if(textStatus==='success'){
		      window.cities = new BaseCollection(data);
		      window.citiesView = new CityView({collection:window.cities});
		      containers.city.children().remove();
		      containers.city.append(citiesView.el);		      
		      window.citiesView.render();
		  }
	      });//getJSON
}

$(function(){
    init();
});

