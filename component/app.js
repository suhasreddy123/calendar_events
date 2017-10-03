

let app = angular.module('app', ['ui.router', 'ngMaterial', 'ngMessages']);

app.config(function($stateProvider, $urlServiceProvider) {
 $urlServiceProvider.rules.otherwise({ state: 'tasks' });
  
  $stateProvider.state('tasks', {
    url: '/',
    component: 'main',
    resolve: {
      date: function() {
      	return "";
      }
    }
  });
    
  $stateProvider.state('tasks.eventCard', {
    url: '/:date',
    component: 'eventCard',
    resolve: {
    	timeslots: function($transition$, EventService){
    		const date = $transition$.params().date;
    		return EventService.getEvents(date);
    	}
  	}
  });

});


function EventService($http, $q) {  
  var date="";
  function setDate(d){
  	date=d;
  }
  function prepareTimeSlots(srcList, date) {
	  var list = [], dest = [];
	  list = list.concat(srcList.classes, srcList.events, srcList.facilities);
	  for(var i=0; i<list.length; i++){
      	var src = list[i];
      	var o = {};
      	o.type = (src.class_name)?"Class":(src.facility_name?"Facility":"Event");
      	o.name = "" || src.class_name || src.name || src.facility_name || "";
		o.s_time = src.starttime;
		o.e_time = src.endtime;
		o.state = (o.type==="Class") ? src.strength +"/"+src.available_spots : 
		((o.type==="Facility") ? (src.notAvailable===0? 'Available' : 'NotAvailable') : src.staff.length + " trainers");

		o.duration = getDuration(date + " "+o.s_time, date + " "+o.e_time);
		o.price = src.price;
		o.trainers = src.staff;
		

		dest.push(o);
      }
      var grpItems = groupBy(dest, "s_time");
     
      var timeslots = [];
      for(var k in grpItems){
      	 var o = {};
      	 o.timeslot = k;
      	 o.events = grpItems[k];
      	 timeslots.push(o);
      }

      return timeslots;

}
function getDuration(now, then){
	var duration = moment.duration(moment(then).diff(moment(now)));
  	var hours = parseInt(duration.asHours());
  	var minutes = parseInt(duration.asMinutes())-hours*60;

  	var datestring = (hours>0? (hours + " hr") : "") + (minutes>0? (" "+minutes + " mins") : "");
  	return datestring;

}

function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}
 return {
      	getEvents(date) { 
	      setDate(date);
	      return $http.get(`data/${date}.json`).
	      then(
	      	resp => { 
	      		var data = resp.data; return prepareTimeSlots(data.data, date);
	      	},
	      	err =>{
	      		if (err.status == 404){
	      			return [];
	      		}
	      	}
	      );
	    }
	}
}


const eventCard = {
	bindings: {
		timeslots: '<'
	},
	template: `
		<div ng-if="$ctrl.timeslots.length ===0"> No Calendar Events!! </div>
		<div ng-repeat="item in $ctrl.timeslots | orderBy:'timeslot'">
			<event-time-slot timeslot="$ctrl.convertTo12HourFormat(item.timeslot)" date="item.date">
  			</event-time-slot>
  			<event-list events="item.events"><event-list/>
		</div>
		
	`,
	controller: class EventCardController {
		constructor() {
			
		}
		$onInit() {
			
		}
		convertTo12HourFormat(time){
			return moment(time, ["HH:mm:ss"]).format("hh:mm a");
	    }
	}
};

const main = {
  	template: ` 		
  	<event-form></event-form>
  	<div class="customer-website-main-section">
			<div class="customer-website-right tech-task">
				<div class="client-schedule-card-list">
					<div class="schedule-card-parent-wrapper">
						<div>
						  <div ui-view></div>
						</div>
					</div>
					<div class="alt-padding client-website-header-bottom-wrapper"></div>
				</div>
			</div>
		</div>`,
 	controller: class MainController{
	    constructor() {
	    	console.log("init");
	    }
	    $onInit() {
	     
	    }
	    
	}
};

const eventForm = {
	bindings: {
		onSelect: '&'
	},
	template: `
		<div layout-gt-xs="row">
		    <div flex-gt-xs>
		      <md-datepicker ng-model="$ctrl.myDate" ng-change="$ctrl.checkSchedule()" md-placeholder="Enter date" md-is-open="ctrl.isOpen"></md-datepicker>
		      <md-button class="md-primary md-raised" ng-click="ctrl.isOpen = true">Open</md-button>
		    </div>
		  </div>
	
	`,
	controller: class EventFormController {
		constructor($state){
			this.state = $state;
			
		}
		$onInit(){
			this.myDate = new Date();
  			this.isOpen = false;
		}
		checkSchedule(){
			var selected = moment(this.myDate).format('YYYY-MM-DD');
			this.state.go('tasks.eventCard', { 'date':  selected}, {reload: 'tasks.eventCard'});
		}

	}
};

const eventTimeSlot = {
	bindings: {
		timeslot: '<',
		date:'<'
	},
	template: `
		<div class="client-schedule-date-time-wrapper">
			<div data-delay="0" class="client-schedule-time-dropdown w-dropdown">
				<div class="schedule-time-dropdown-toggle w-dropdown-toggle">
					<div class="schedule-time-dropdown-text">{{$ctrl.timeslot}}</div>
					<img src="https://daks2k3a4ib2z.cloudfront.net/57e9234385a476a775f538fd/595a0d6de24ce63abb9d2ec3_down-arrow-min.png" class="filter-down-arrow">
				</div>
				<nav class="w-dropdown-list"><a href="#" class="w-dropdown-link">Link 1</a><a href="#" class="w-dropdown-link">Link 2</a><a href="#" class="w-dropdown-link">Link 3</a></nav>
			</div>
			<div class="day-date-line w-hidden-tiny"></div>
			<div class="client-schedule-time-dropdown no-right-margin">
				<div class="schedule-time-dropdown-toggle">
					<div class="date schedule-time-dropdown-text">{{$ctrl.date}}</div>
				</div>
			</div>
			<div class="day-date-line longer w-hidden-medium w-hidden-small w-hidden-tiny"></div>
		</div>
	`,
	controller: class EventTimeSlotController {
		constructor() {

		}
		$onInit() {
			
		}
	}
};

const eventList = {
	bindings: {
		events: '<'
	},
	template: `
		<div class="client-schedule-card" ng-repeat="event in $ctrl.events | orderBy:'e_time'">
			<event event="event"></event>			
		</div>
	`,
	controller: class EventListController {
		constructor() {

		}
		$onInit() {
			
		}
	}
};


const event = {
	bindings: {
		event: '<'
	},
	template: `
		<div class="schedule-card-top-section">
			<div class="schedule-card-left-section">
				<div class="schedule-card-name">{{$ctrl.event.name}}</div>
				<div class="schedule-card-details-wrapper">
					<div class="schedule-card-details">{{$ctrl.convertTo12HourFormat($ctrl.event.s_time)}} - 
						{{$ctrl.convertTo12HourFormat($ctrl.event.e_time)}}
					</div>
					<div class="bullet-point-empty filled-bullet"></div>
					<div class="card-availability schedule-card-details">{{$ctrl.event.state}}</div>
					<div class="bullet-point-empty filled-bullet w-hidden-small w-hidden-tiny"></div>
					<div class="schedule-card-details w-hidden-small w-hidden-tiny">{{$ctrl.event.duration}}</div>
					<div class="bullet-point-empty filled-bullet w-hidden-small w-hidden-tiny"></div>
					<div class="schedule-card-details w-hidden-small w-hidden-tiny">{{$ctrl.event.type}}</div>
				</div>
			</div>
			<div class="trainer-price-wrapper">
				<a href="#" class="schedule-card-right-section w-inline-block">
					<div  ng-repeat="trainer in $ctrl.event.trainers" ng-class="$index < 2 ? 'client-schedule-trainer-wrapper' : 
					'client-schedule-trainer-wrapper no-right-margin' ">
						<div ng-if="($index < 2 && $ctrl.event.trainers.length>3) || ($ctrl.event.trainers.length<=3)" class="alt-img client-schedule-trainer-img">
						</div>
						<div ng-if="$index == $ctrl.event.trainers.length - 1 && $ctrl.event.trainers.length > 3" class="client-schedule-trainer-img plus-img">
							<div class="plus-text">+{{$ctrl.event.trainers.length-2}}</div>
						</div>
					</div>
				</a>
				<div class="schedule-price w-hidden-main w-hidden-medium w-hidden-small">{{$ctrl.event.price}}</div>
			</div>
		</div>
		<div class="schedule-price-cta-wrapper">
			<div class="schedule-price w-hidden-tiny">{{$ctrl.event.price | currency : $ : 0}}</div>
			<div class="double-cta-wrapper">
				<a href="#" class="no-right-margin schedule-primary-cta secondary-cta w-inline-block">
					<div>View Details</div>
				</a>
				<a href="#" class="no-right-margin schedule-primary-cta w-inline-block">
					<div>Book Now</div>
				</a>
			</div>
		</div>
	`,
	controller: class EventController {
		constructor() {

		}
		$onInit() {
			
		}
		convertTo12HourFormat(time){
			return moment(time, ["HH:mm:ss"]).format("hh:mm a");
	    }
	    getDuration(now, then){
	    	var duration = moment.duration(moment(then).diff(moment(now)));
		  	var hours = parseInt(duration.asHours());
		  	var minutes = parseInt(duration.asMinutes())-hours*60;

		  	var datestring = (hours>0? (hours + " hr") : "") + (minutes>0? (" "+minutes + " mins") : "");
		  	return datestring;

	    }
	}
};


app.component('main', main)
		.component('eventForm', eventForm)
		.component('eventTimeSlot', eventTimeSlot)
		.component('eventList', eventList)
		.component('event', event)
		.component('eventCard', eventCard)
		.service('EventService',EventService);

