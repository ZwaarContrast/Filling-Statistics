/*
 * Script for cicular animating statistics
 *
 * Version: 1.0
 *
 * Author: Roy Bakker
 *
 * Contact: roy@zwaarcontrast.nl
 *
 * Dependencies: jQuery
 *
 * Notes: Depends on the "borderradius" class on the HTML tag to check if we need to animate the border
 *
 */

(function($, window, document, undefined) {
	"use strict";

	//Constructor
	var Statistic = function(elem, options) {
		this.element = $(elem);
		this.options = options;
	};

	//Prototype
	Statistic.prototype = {

		defaults:{
			start:0,
			speed:0.8,
			accelleration:0.02,
			autostart:false
		},

		//Initialisation
		init: function() {
			//Get the options and merge with defaults
			this.config = $.extend({}, this.defaults, this.options, this.metadata);

			//Status
			this.animating = (this.config.autostart) ? true : false;
			this.started =  (this.config.autostart) ? true : false;
			this.done = false;

			//Variables
			this.goalPercentage = 0;
			this.currentPercentage=this.config.start;
			this.currentDegrees=360/100*this.currentPercentage;
			this.currentText="";
			this.currentSpeed = this.config.speed;
			this.accelleration = this.config.accelleration;

			//Call functions
			this.getElements();
			this.getData();

			//Bind events
			this.bindScroll();
			this.bindRequestKeyframes();
			this.bindCustomEvents();

			//Set initial
			this.setText();
			this.setRotation();

			return this;
		},
		getElements: function(){
			//Get necessary elements
			this.percentage = this.element.find('.statistic-percentage');
			this.wrapper = this.element.find('.statistic-wrapper');
			this.sliceLeft = this.element.find('.statistic-slice-left');
			this.noBorderRadius = !$('html').hasClass('borderradius');
		}, 
		getData: function(){
			//Get the percentage we will animate to
			this.goalPercentage = this.element.attr('data-statistic-percentage');

			//Debug console log
			// console.log("Percentage found: "+this.goalPercentage);
		},
		bindScroll: function(){
			var _self = this, timer,scroll;

			//Bind scroll
			$(window).scroll(function() {
				scroll = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop
				if(!_self.done){
					//Check scroll if we need to start playing the animation
					if(scroll+$(window).height()*0.75> _self.element.offset().top && scroll < _self.element.offset().top+$(window).height()){
						_self.playStatistic();
					}
					//Check scroll to reset the animatin
				}else if(scroll>_self.element.offset().top+$(window).height()){
					_self.resetStatistic();
				}
			});
		},
		bindRequestKeyframes:function(){
			//Loop for Animation of the handler
			window.requestAnimFrame = (function(){
				return  window.requestAnimationFrame       ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame    ||
						window.oRequestAnimationFrame      ||
						window.msRequestAnimationFrame     ||
						function( callback ){
							window.setTimeout(callback, 1000 / 60);
						};
			})();

			var _self = this;
			(function animloop(){
				//Call for animation loop
				window.requestAnimFrame(animloop);
				_self.animateElements();
			})();
		},
		bindCustomEvents:function(){
			var _self = this;

			//Bind on the statisticStart event to start the animation
			$(this.element).bind('statisticStart',function(){
				_self.playStatistic();
			});

			//Bind on the statisticStop event to pause the animation
			$(this.element).bind('statisticStop',function(){
				_self.stopStatistic();
			});

			//Bind on the statisticReset event to reset the animation
			$(this.element).bind('statisticReset',function(){
				_self.resetStatistic();
				
			});

			//Bind on the statisticReset event to reset the animation and play again
			$(this.element).bind('statisticResetStart',function(){
				_self.resetStatistic();
				_self.playStatistic();
			});

		},
		playStatistic: function(){
			this.started = true;
			this.animating = true;
		},
		stopStatistic: function(){
			this.animating = false;
		},
		resetStatistic: function(){
			this.done = false;
			this.animating = false;
			this.currentSpeed = this.config.speed;
			this.currentPercentage=this.config.start;
			this.currentDegrees=360/100*this.currentPercentage;
			this.setText();
			this.setRotation();
		},
		animateElements: function(){
			if(this.started){
				if(this.animating){
					if(!this.done){
						//Up up and accellerate
						this.currentPercentage+=this.currentSpeed;
						this.currentSpeed += this.accelleration;

						//Check for done
						if(this.currentPercentage>this.goalPercentage){
							this.currentPercentage = this.goalPercentage;
							this.done=true;
						}

						//Check for border radius support
						if(!this.noBorderRadius){
							this.setRotation();
						}

						//Set text
						this.setText();
					}
				}
			}
		},
		setRotation:function(){
			//Calculate degrees
			this.currentDegrees = 360/100*this.currentPercentage;

			//Check for halfway
			if(this.currentPercentage>50){
				this.wrapper.addClass('statistic-wrapper-halfway');
			}else{
				this.wrapper.removeClass('statistic-wrapper-halfway');
			}

			//Check for arrow change
			if(this.currentDegrees>175){
				this.element.addClass('statistic-halfway');
			}else{
				this.element.removeClass('statistic-halfway');
			}

			//Rotate left slice
			this.sliceLeft.css({
				'-moz-transform':'rotate('+this.currentDegrees +'deg)',
				'-webkit-transform':'rotate('+this.currentDegrees +'deg)',
				'-o-transform':'rotate('+this.currentDegrees +'deg)',
				'transform':'rotate('+this.currentDegrees +'deg)'
			});
		},
		setText: function(){
			//Get current percentage and round
			this.currentPercentage = Math.round(this.currentPercentage);

			//Check if we are at the goad, if so display with decimals
			if(this.currentPercentage>=this.goalPercentage){
				this.currentPercentage = this.goalPercentage;
			}

			//Create text
			this.currentText = this.currentPercentage+"%";

			//Use commas
			this.currentText = this.currentText.replace('.',',');

			//Display
			this.percentage.html(this.currentText);
		}
	};

	//Extend Jquery with the Statistic function/object
	$.fn.Statistic = function(options) {
		return this.each(function() {
			//Construct new Statistic object and call initialisation function
			new Statistic(this, options).init();
		});
	};
})(jQuery, window, document);