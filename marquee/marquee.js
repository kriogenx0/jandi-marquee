// FUNCTION PLACE HOLDER FOR MUSTAFA
var applyEffects = function (){ImageToolsGlobal.debug("applyEffects")};
var highlightLayer = function(){ImageToolsGlobal.debug("highlightLayer")};
var lowlightLayer = function(){ImageToolsGlobal.debug("lowlightLayer")};
var activateLayer = function(){ImageToolsGlobal.debug("activateLayer")};

/*
// Auction123 Image Tools Marquee
// By Alex Vaos 12/2009
// avaos@auction123.com
*/

// GLOBAL VARIABLES
var ImageToolsGlobal = function (){
	var _mousePosition;
	// selected = element
	// actions
	//		p = moving pointer
	//		m = moving
	//		nw = northwest, se = southeast, etc.
	function debug(msg) {
		if (window.console && window.console.log) window.console.log(msg);
	}
	
	return {
		mousePosition: _mousePosition,
		selected: 0,
		editing: 0,
		action:	'',
		mousedown: false,
		type: 0,
		right: 0,
		bottom: 0,
		marquees: [],
		id: 0,
		debug: debug
	}
	
}();



// CLASS
var ImageToolsMarquee = function(imgName, layerId) {
	
	/*
	ELEMENTS CREATED:
	marquee-guts: 	everything inside the marquee, including its functionality
	controls: 		little handles at the ends of the marquee (no functionality)
	areas: 			parts of the container that arent the marquee
	resizers: 		used to control resizing
	mover-mask:		used as an invisible div for moving only
	*/
	
	var o = { // OPTIONS
		showAreas: false,
		showControls: true,
		resizerSize: 10,
		showMasks: false,
		minimumSize: 10,
		startDeslected: false,
		selectOnly: true,
		debug: true
	};
	
    // private
    var _img = imgName,
    	_iw = _img.width(),
    	_ih = _img.height(),
		_ctn,
		_mrq,
		_pointer,
		_marqueeOrder,
		_selected = true,
		_layerId = layerId;
    var _mousePos;
    var _lastLeft = 100;
    var _lastTop = 100;
    var _lastWidth = 200;
    var _lastHeight = 200;
    var _resizers = new Array();
    var _a = new Array();
    var defaults = {
        marquee: {
            css: {
                'position': "absolute",
                'z-index': "3",
                'left': 100,
                'top': 200
            },
            w: 300,
            h: 200
        },
        pointer: {
            css: {
                'position': 'absolute',
                'left': 0,
                'top': 0,
                'z-index': 10,
                'cursor': 'default'
            },
            width: 14,
            height: 14
        },
        areas: {
            css: {
                'background': '#111',
                'opacity': 0.2,
                'filter': 'alpha(opacity=20)',
                'z-index': 1,
                'position': 'absolute'
            }
        },
        resizers: {
            css: {
                'z-index': 4,
                'position': 'absolute'
            }
        },
        container: {
            css: {
                'position': 'absolute'
            }
        }
    }
	
	function debug(msg) {
		if (window.console && window.console.log && o.debug) window.console.log(msg);
	}

    var _strp = function(inp) {
        return parseInt(inp.toString().replace('px', ''));
    }
    var _noSlct = function(target) {
		target = jQuery(target);
		
		if (jQuery.browser.mozilla) {
            return target.each(function() {
                target.css({
                    'MozUserSelect' : 'none'
                });
            });
   		} else if (jQuery.browser.msie) {
            return target.each(function() {
                target.bind('selectstart.disableTextSelect', function() {
                    return false;
                });
            });
   		} else {
            target.onselectstart = function() { return false }
			/*
            return target.each(function() {
                target.bind('mousedown.disableTextSelect', function() {
                    return false;
                });
            });*/
			
			/*
			if (typeof target.onselectstart != "undefined") //IE route
				target.onselectstart = function() { return false }
			else if (typeof target.style.MozUserSelect != "undefined") //Firefox route
				target.style.MozUserSelect = "none"
			*/
   		}
			
    }

    jQuery(document).mousemove(function(e) {
        _mousePos = { x: e.pageX, y: e.pageY };
    });
    var _mouseOffset = function(target) {
        return {
            x: _mousePos.x - target.offset().left,
            y: _mousePos.y - target.offset().top
        };
    }
	var _ctnMouse = function () {
		var coord = {
			x: _mousePos.x - _strp(_img.offset().left),
			y: _mousePos.y - _strp(_img.offset().top)
		}
		if (coord.x < 0) {
			coord.x = 0;
		} else if (coord.x > _imgw) {
			coord.x = _imgw;
		}
		if (coord.y < 0) {
			coord.y = 0;
		} else if (coord.y > _imgh) {
			coord.y = _imgh;
		}
		return coord;
	};

    //var _updateLocation;

    var _checkDimensions = function(elmt) { // CUT IMAGE
        if (!elmt) elmt = ImageToolsGlobal.editing;
        var w = _strp(elmt.width());
        var h = _strp(elmt.height());
        var maxw = _strp(_img.width()) - _strp(elmt.css('left'));
        var maxh = _strp(_img.height()) - _strp(elmt.css('top'));

        if (w < o.minimumSize) {
            elmt.width(o.minimumSize);
        } else if (w > maxw) {
            elmt.width(maxw);
        } else {
            elmt.width(w);
        }

        if (h < o.minimumSize) {
            elmt.height(o.minimumSize);
        } else if (h > maxh) {
            elmt.height(maxh);
        } else {
            elmt.height(h);
        }

    }

    var _checkPosition = function(elmt) { // MOVE IMAGE
        if (!elmt) elmt = ImageToolsGlobal.editing;
        var l = _strp(elmt.css('left'));
        var t = _strp(elmt.css('top'));
        var maxx = _strp(_img.width()) - _strp(elmt.width());
        var maxy = _strp(_img.height()) - _strp(elmt.height());

        if (l < 0) {
            elmt.css('left', 0);
        } else if (l > maxx) {
            elmt.css('left', maxx);
        } else {
            elmt.css('left', l);
        }

        if (t < 0) {
            elmt.css('top', 0);
        } else if (t > maxy) {
            elmt.css('top', maxy);
        } else {
            elmt.css('top', t);
        }

    }
	
	var _startAction = function(actionName, elmt) {
		ImageToolsGlobal.editing = elmt || _mrq;
		ImageToolsGlobal.action = actionName;
		ImageToolsGlobal.mousedown = true;
		jQuery(document).bind("mousemove", _updatePosition);
		debug("START ACTION: " + ImageToolsGlobal.action + "\nON: " + ImageToolsGlobal.editing);
	};
	
	var _endAction = function() {
		//ImageToolsGlobal.editing = null;
		ImageToolsGlobal.action = null;
		ImageToolsGlobal.mousedown = false;
		jQuery(document).unbind("mousemove", _updatePosition);
	};

    var _createMarquee = function() {
        if (!_img) return;
		
		var mrqHeight;
		var mrqWidth; 

        // CREATE CONTAINER
        if (!_img.parent().hasClass('it-container')) {
            _ctn = jQuery("<div class='it-container' style='position: absolute'></div>").appendTo("body");
            _img.wrap(_ctn);
            _ctn.addClass('it-container');
            _ctn.css(defaults.container.css);
            _noSlct(_ctn);
            _noSlct(_img);

            var _imglayover = jQuery("<div class='it-layover'> </div>").appendTo("body");
            _img.before(_imglayover);
            _imglayover.css({
                'position': 'absolute',
                'left': 0,
                'top': 0,
                'z-index': 1
            });
            _imglayover.width(_iw);
            _imglayover.height(_ih);
            _noSlct(_imglayover);
        }
		
		// CREATE MARQUEE DIV
		_mrq = jQuery("<div> </div>").appendTo("body");
		_img.before( _mrq );
		_mrq.addClass("it-marquee");
		_mrq.css(defaults.marquee.css);
		mrqWidth = _mrq.width(defaults.marquee.w);
		mrqHeight = _mrq.height(defaults.marquee.h);
		
		// CREATE MARQUEE GUTS DIV
		_marequeeGutsContainer = jQuery("<div> </div>").appendTo(_mrq);
		_marequeeGutsContainer.addClass("it-marquee-guts");
		
		// MARQUEE GUTS
		var gutsClasses = ['marquee-bordertop', 'marquee-borderright', 'marquee-borderbottom', 'marquee-borderleft',
		'marquee-control-nw', 'marquee-control-n', 'marquee-control-ne', 'marquee-control-w', 'marquee-control-e', 'marquee-control-sw', 'marquee-control-s', 'marquee-control-se'
		];
		var _marqueeGuts = new Array();
		for (i = 0; i <= gutsClasses.length - 1; i++) {
			_marqueeGuts[i] = jQuery("<div> </div>").appendTo(_marequeeGutsContainer);
			if (i < 4) {
				_marqueeGuts[i].addClass("marquee-borders");
			}
			if (i >= 4) {
				_marqueeGuts[i].addClass("marquee-controls");
			}
			_marqueeGuts[i].addClass(gutsClasses[i]);
		}
		
		// CREATE MOVER MASK
		var _moverMask;
		_moverMask = jQuery("<div> </div>").appendTo(_marequeeGutsContainer);
		_moverMask.addClass("marquee-mover-mask");
		if (o.showMasks) _moverMask.css("background", "#090");

        // INVERSE AREAS
		if (o.showAreas) {
			for (i = 1; i <= 0; i++) {
	
				_a[i] = jQuery("<div> </div>").appendTo("body");
				_img.before(_a[i]);
				/*
				if (i == 0) {
					_a[i].addClass("it-marquee");
					_a[i].css(defaults.marquee.css);
					_a[i].width(defaults.marquee.w);
					_a[i].height(defaults.marquee.h);
					_mrq = _a[i];
	
				} else { */
					_a[i].addClass("it-areas");
					_a[i].css(defaults.areas.css);
				//}
				//_img.before('<div id="it-area-' + i + '"> </div>');
				//_a[i] = jQuery('#it-area-' + i);
			}
		}
		
		
		// CREATE RESIZERS CONTAINER
		/*_resizersContainer = jQuery("<div> </div>").appendTo(_ctn);
		_resizersContainer.addClass("marquee-resizers");
        _img.before(_resizersContainer);
		*/
				
        // CREATE RESIZERS
		var resizerNames = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
		var resizerFunctions = new Array();
		for (i = 0; i <= resizerNames.length - 1; i++) {
			_resizers[i] = jQuery("<div> </div>").appendTo(_marequeeGutsContainer);
			_resizers[i].addClass("marquee-resizer");
			_resizers[i].addClass("marquee-resizer-" + resizerNames[i]);
       		_resizers[i].css('cursor', resizerNames[i] + '-resize');
       		_resizers[i].css('position', 'absolute');
			if (o.showMasks) _resizers[i].css({
				background: "#900",
				display: "block"
			});
			/*
			resizerFunctions[i] = function () {
				ImageToolsGlobal.editing = _mrq;
            	ImageToolsGlobal.action = resizerNames[i];
			}
			_resizers[i].mousedown(resizerFunctions[i]);
			*/
			/*
			_resizers[i].mousedown( function() {
				ImageToolsGlobal.type = "m";
				ImageToolsGlobal.editing = _mrq;
            	ImageToolsGlobal.action = resizerNames[i];
			});*/
								
		}
		
		
		
		
        // CREATE RESIZERS OLD
		/*
        for (i = 1; i <= 3; i++) {
            _r[i] = jQuery("<div> </div>").appendTo(_marequeeGutsContainer);
            _img.before(_r[i]);
            _r[i].addClass("it-resizer");
            _r[i].css(defaults.resizers.css);
        }*/
		// RESIZER STATIC SIZES
			
		// NW
		_resizers[0].width(o.resizerSize * 2);
		_resizers[0].height(o.resizerSize * 2);
		_resizers[0].css("top", -o.resizerSize);
		_resizers[0].css("left", -o.resizerSize);
        _resizers[0].mousedown(function() {
            _startAction('nw');
        });
		
		// N
		_resizers[1].height(o.resizerSize * 2);
		_resizers[1].css("top", -o.resizerSize);
		_resizers[1].css("left", o.resizerSize);
		_resizers[1].css("right", o.resizerSize);
        _resizers[1].mousedown(function() {
            _startAction('n');
        });
		
		// NE
		_resizers[2].width(o.resizerSize * 2);
		_resizers[2].height(o.resizerSize * 2);
		_resizers[2].css("top", -o.resizerSize);
		_resizers[2].css("right", -o.resizerSize);
        _resizers[2].mousedown(function() {
            _startAction('ne');
        });
		
		// W
		_resizers[3].width(o.resizerSize * 2);
		_resizers[3].css("top", o.resizerSize);
		_resizers[3].css("left", -o.resizerSize);
		_resizers[3].css("bottom", o.resizerSize);
        _resizers[3].mousedown(function() {
            _startAction('w');
        });

        // E
        _resizers[4].width(o.resizerSize * 2);
		_resizers[4].css("top", o.resizerSize);
		_resizers[4].css("right", -o.resizerSize);
		_resizers[4].css("bottom", o.resizerSize);
        _resizers[4].mousedown(function() {
            _startAction('e');
        });
		
		// SW
		_resizers[5].width(o.resizerSize * 2);
		_resizers[5].height(o.resizerSize * 2);
		_resizers[5].css("left", -o.resizerSize);
		_resizers[5].css("bottom", -o.resizerSize);
        _resizers[5].mousedown(function() {
            _startAction('sw');
        });
		
        // S
		_resizers[6].height(o.resizerSize * 2);
		_resizers[6].css("left", o.resizerSize);
		_resizers[6].css("right", o.resizerSize);
		_resizers[6].css("bottom", -o.resizerSize);
        _resizers[6].mousedown(function() {
            _startAction('s');
        });
        // SE
		_resizers[7].width(o.resizerSize * 2);
		_resizers[7].height(o.resizerSize * 2);
		_resizers[7].css("right", -o.resizerSize);
		_resizers[7].css("bottom", -o.resizerSize);
        _resizers[7].mousedown(function() {
            _startAction('se');
        });
		

		
		/*
		_updateLocation = function() {
			if (!_mrq) return;
			_mrqw = _strp(_mrq.width());
			_mrqh = _strp(_mrq.height());
			_mrqt = _strp(_mrq.css('top'));
			_mrql = _strp(_mrq.css('left'));
	
			// UPDATE RESIZERS' POSITIONS
			// NW
			_resizers[0].css('top', _mrqt - o.resizerSize);
			_resizers[0].css('left', _mrql - o.resizerSize);
			// N
			_resizers[1].css('top', _mrqt - o.resizerSize);
			_resizers[1].css('left', _strp(_mrq.css('left')) + _mrqw - o.resizerSize);
			_resizers[1].height(_mrqh - o.resizerSize);
	
			_resizers[2].css('top', _mrqh + _strp(_mrq.css('top')) - o.resizerSize);
			_resizers[2].css('left', _mrq.css('left'));
			_resizers[2].width(_mrqw - (o.resizerSize * 2));
			_resizers[2].height(o.resizerSize);
	
			_resizers[3].css('top', _mrqh + _strp(_mrq.css('top')) - o.resizerSize);
			_resizers[3].css('left', _mrqw + _strp(_mrq.css('left')) - o.resizerSize);
	
		};
        _updateLocation();
			*/
		
		// ADD EVENTS
        
        _moverMask.mouseover(function(ev){
			if (!ImageToolsGlobal.mousedown) {
				_mrq.addClass("marquee-over");
				ImageToolsGlobal.editing = _mrq;
				ImageToolsGlobal.id = ImageToolsGlobal.marquees[_marqueeOrder - 1];
				debug("Mouseovered " + ImageToolsGlobal.editing[0] + " " + ImageToolsGlobal.id + " " + (_marqueeOrder - 1));
				highlightLayer();
			}
			/*
			if (!jQuery(document).mousedown) {
				ImageToolsGlobal.editing = _mrq;       
			}
			*/
			// focus layer
			
			
			//bind mouse movement and mouse out actions
			/*
			var mouseOut;
			_mrq.bind("mouseout", mouseOut = function(ev) {
				_mrq.removeClass("marquee-over");
				// blur layer
				_mrq.unbind("mouseout", mouseOut);
				
			});
			*/
			
        });
		
		_moverMask.mouseout(function(ev) {
			if (!ImageToolsGlobal.mousedown) {
				ImageToolsGlobal.editing.removeClass("marquee-over");
				_endAction();
				debug("MOUSEOUT");
				lowlightLayer();
			}
			// blur layer
			
		});
        

        _moverMask.dblclick(function() {
            _iw = _img.width();
            _ih = _img.height();
            if (_mrq.width() == _iw && _mrq.height() == _ih) {
                _mrq.width(_lastWidth);
                _mrq.height(_lastHeight);
                _mrq.css('left', _lastLeft);
                _mrq.css('top', _lastTop);
            } else {
                _lastTop = _mrq.css('top');
                _lastLeft = _mrq.css('left');
                _lastWidth = _mrq.width();
                _lastHeight = _mrq.height();
                _mrq.width(_iw);
                _mrq.height(_ih);
                _mrq.css('left', 0);
                _mrq.css('top', 0);
            }
            _checkDimensions(_mrq);
            _mrq.trigger('marqueeRelease', _mrq);
        });

        _moverMask.mousedown(function(ev) {
            //ImageToolsGlobal.editing = el;
            ImageToolsGlobal.editing = _mrq;
            ImageToolsGlobal.editing.addClass('marquee-moving');
            ev = ev || window.event;
            mouseOffset = _mouseOffset(ImageToolsGlobal.editing, ev);
            _mrq.trigger('marqueeGrab', _mrq);
			debug(ImageToolsGlobal.editing);
			
			_startAction('m');
			
			activateLayer();
			_selectOnly();
        });

        _updatePosition = function() {

            if (!ImageToolsGlobal.editing || !ImageToolsGlobal.action) return;
			
			_imgw = _img.width();
			_imgh = _img.height();
			_mrqw = _strp(ImageToolsGlobal.editing.width());
			_mrqh = _strp(ImageToolsGlobal.editing.height());
			_mrql = _strp(ImageToolsGlobal.editing.css('left'));
			_mrqt = _strp(ImageToolsGlobal.editing.css('top'));

			
			// TOP RESIZING
			if (ImageToolsGlobal.action.indexOf('n') >= 0) {
				// get difference of offset to mouse pos, then add to width
				
				// bottom position starts with
				// ImageToolsGlobal.editing.offset().top
				// + 
				
				//var totalBottom = _mrqt + _mrqh;
				//debug(totalBottom);
				
				var mousey = _mousePos.y - _strp(_img.offset().top);
				if (mousey < 0) {
					mousey = 0;
				} else if (mousey > _imgh) {
					mousey = _imgh;
				}
				
				var yDiff = mousey - _mrqt;
				var newy = mousey;

                var newh =  _mrqh - yDiff;
                var maxh = _imgh - newy;
				
				// VERIFY
				
				if (newy < 0) {
                    newy = 0;
                } else if (newy > maxy) {
                    newy = maxy;
               	}
				
                if (newh < o.minimumSize) {
					newy += newh - o.minimumSize;
                    newh = o.minimumSize;
                } else if (newh > maxh) {
					newy += newh - maxh;
                    newh = maxh;
				}
				ImageToolsGlobal.editing.height(newh);
				ImageToolsGlobal.editing.css('top', newy);
                /*
				debug("Offset: " + ImageToolsGlobal.editing.offset().top +
						"\nMouse Y: " + _mousePos.h +
						"\nHeight: " + _mrqh + 
						"\n" + newy +
						"\nDifference: " + yDiff
				);//*/

            }
			
			// LEFT RESIZING
			if (ImageToolsGlobal.action.indexOf('w') >= 0) {
				
				var totalLeft = _mrql + _mrqw;
				debug(totalLeft);
				
				// CONTAINER MOUSE
				var mousex = _mousePos.x - _strp(_img.offset().left);
				if (mousex < 0) {
					mousex = 0;
				} else if (mousex > _imgw) {
					mousex = _imgw;
				}
				
				var xDiff = mousex - _mrql;
				var newx = mousex;

                var neww =  _mrqw - xDiff;
                var maxw = _imgw - newx;
				
				// VERIFY
				
				if (newx < 0) {
                    newx = 0;
                } else if (newx > maxx) {
                    newx = maxx;
               	}
				
                if (neww < o.minimumSize) {
					newx += neww - o.minimumSize;
                    neww = o.minimumSize;
                } else if (neww > maxw) {
					newx += neww - maxw;
                    neww = maxw;
				}
				ImageToolsGlobal.editing.width(neww);
				ImageToolsGlobal.editing.css('left', newx);
				
				debug("LEFT RESIZING" +
					  	"\nOffset: " + ImageToolsGlobal.editing.offset().left +
						"\nTotal Position: " + totalLeft +
						"\nMouse x: " + _mousePos.x +
						"\nPosition: " + _mrqw + 
						"\n" + neww +
						"\nDifference: " + xDiff
				);//*/

            }
			
			
			// RIGHT RESIZING
            if (ImageToolsGlobal.action.indexOf('e') >= 0) {

                var neww = _mousePos.x - _mrql;
                var maxw = _imgw - _mrql;

                if (neww < o.minimumSize) {
                    neww = o.minimumSize;
                } else if (neww > maxw) {
                    neww = maxw;
                }
				ImageToolsGlobal.editing.width(neww);

            }
			// BOTTOM SIZING
            if (ImageToolsGlobal.action.indexOf('s') >= 0) {

                var newh = _mousePos.y - ImageToolsGlobal.editing.offset().top;
                var maxh = _img.height() - _strp(ImageToolsGlobal.editing.css('top'));

                if (newh < o.minimumSize) {
                    newh = o.minimumSize;
                } else if (newh > maxh) {
                    newx = maxh;
                }
				ImageToolsGlobal.editing.css('height', newh);

            }
            if (ImageToolsGlobal.action != 'm' && ImageToolsGlobal.action != 'p') {

                // _updateLocation(ImageToolsGlobal.editing, _img);
                _checkDimensions(ImageToolsGlobal.editing);
                if (ImageToolsGlobal.editing == _mrq) {
                    _mrq.trigger('marqueeResize', _mrq);
                }
                return;
            }
			// MOVING
            if (ImageToolsGlobal.action == 'm') {

                var newx = _mousePos.x - _img.offset().left - mouseOffset.x;
                var newy = _mousePos.y - _img.offset().top - mouseOffset.y;
                var maxx = _img.width() - ImageToolsGlobal.editing.width();
                var maxy = _img.height() - ImageToolsGlobal.editing.height();

                if (newx < 0) {
                    newx = 0;
                } else if (newx > maxx) {
                    newx = maxx;
				}
				ImageToolsGlobal.editing.css('left', newx);

                if (newy < 0) {
                    newy = 0;
                } else if (newy > maxy) {
                    newy = maxy;
				}
				ImageToolsGlobal.editing.css('top', newy);

                // _updateLocation();
                _checkPosition(ImageToolsGlobal.editing);
                _mrq.trigger('marqueeDrag', _mrq);
				debug("MARQUEE DRAG");

                return false;
            }
			
			// POINTER
			if (ImageToolsGlobal.action == 'p') {

                var newx = _mousePos.x - _img.offset().left - mouseOffset.x;
                var newy = _mousePos.y - _img.offset().top - mouseOffset.y;
                var maxx = _img.width() - ImageToolsGlobal.editing.width();
                var maxy = _img.height() - ImageToolsGlobal.editing.height();

                if (newx < 0) {
                    newx = 0;
                } else if (newx > maxx) {
                    newx = maxx;
				}
				ImageToolsGlobal.editing.css('left', newx);

                if (newy < 0) {
                    newy = 0;
                } else if (newy > maxy) {
                    newy = maxy;
				}
				ImageToolsGlobal.editing.css('top', newy);

                _checkPosition(ImageToolsGlobal.editing);
                _pointer.trigger('pointerDrag', _pointer);
				
				debug("POINTER DRAG");

                return false;
            }
        };

        jQuery(document).mouseup(function() {
            if (ImageToolsGlobal.action == "p") {
                _pointer.trigger('pointerRelease', _pointer);
            } else if (ImageToolsGlobal.action != null && ImageToolsGlobal.action != "") {
                _mrq.trigger('marqueeRelease', _mrq);
				// GLOBAL FUNCTION
				applyEffects();
                ImageToolsGlobal.editing.removeClass('marquee-moving');
            }
			
			_endAction();
        });

        return _mrq;

    };

    var _addPointer = function() {

        _pointer = jQuery("<div> </div>").appendTo("body");
		if (o.showMasks) _pointer.css("background", "#009");
        _img.before(_pointer);

        _pointer.addClass('it-pointer');
        _pointer.css(defaults.pointer.css);
        _pointer.width(defaults.pointer.width);
        _pointer.height(defaults.pointer.height);
		
		_pointer.hover(
			function() {
				_pointer.addClass("pointer-over");	
				debug("POINTER OVER");
			},
			function() {
				_pointer.removeClass("pointer-over");
				debug("POINTER OUT");
			}
		);

        _pointer.mousedown(function(ev) {
            /*ev = ev || window.event;
            _mrq.before(_pointer);
            ImageToolsGlobal.action = 'p';
            ImageToolsGlobal.editing = _pointer;
            mouseOffset = _mouseOffset(ImageToolsGlobal.editing, ev);
			*/
            _pointer.trigger('pointerGrab', _pointer);
			debug("POINTER DOWN");
			mouseOffset = _mouseOffset(_pointer, ev);
			_startAction('p', _pointer);
			
			debug(ImageToolsGlobal.action + " " + ImageToolsGlobal.editing);
        });

        /*_pointer.mouseover(function(ev){
        ImageToolsGlobal.editing = _pointer;
        });*/
        _noSlct(_pointer[0]);
        return _pointer;
    };
	
	// PUBLIC
	///////////////
	var _select = function() {
		_selected = true;
		_mrq.removeClass("marquee-deselected");
		_mrq.css("z-index", 3);
		ImageToolsGlobal.selected = _mrq;
	};
	var _deselect = function() {
		_selected = false;
		_mrq.addClass("marquee-deselected");
		_mrq.css("z-index", 2);
		ImageToolsGlobal.selected = null;
	};
	var _selectOnly = function(marqueeId) {
		for(i = 0; i < ImageToolsGlobal.marquees.length; i++) {
			ImageToolsGlobal.marquees[i].deselect();
			debug("DESELECTING: " + ImageToolsGlobal.marquees[i]);
		}
		if (marqueeId) {
			_selected = false;
			ImageToolsGlobal.selected = ImageToolsGlobal.marquees[marqueeId];
		} else {
			_select();
		}
	};
	var _remove = function() {
		_mrq.remove();
	};

    // RETURN
	/////////////////
	var _return = {

		// PUBLIC PRIVATE
		
        image: imgName,
        container: _ctn,
        marquee: _mrq,
        addPointer: _addPointer,
		select: _select,
		deselect: _deselect,
		selectOnly: _selectOnly,
		remove: _remove,
		
		// PUBLIC ONLY

        hide: function() {
            _mrq.css('display', 'none');
            _pointer.css('display', 'none');
        },
        show: function() {
            _mrq.css('display', '');
            //_pointer.css('display', '');
        },
        toggle: function() {
            if (_mrq.css('display') == 'none') {
                _mrq.css('display', '');
            } else {
                _mrq.css('display', 'none');
            }
        },
        left: function(intval) {
            if (!intval) {
                return _strp(_mrq.css('left'));
            } else {
                _mrq.css('left', intval);
                // _updateLocation(_mrq, _img);
                _checkPosition(_mrq);
            }
        },
        top: function(intval) {
            if (!intval) {
                return _strp(_mrq.css('top'));
            } else {
                _mrq.css('top', intval);
                // _updateLocation(_mrq, _img);
                _checkPosition(_mrq);
            }
        },
        width: function(intval) {
            if (!intval) {
                return _mrq.width();
            } else {
                _mrq.width(intval);
                // _updateLocation(_mrq, _img);
            }
        },
        height: function(intval) {
            if (!intval) {
                return _mrq.height();
            } else {
                _mrq.height(intval);
                // _updateLocation(_mrq, _img);
            }
        },
        pointer: {
            el: _pointer,
            left: function(intval) {
                if (!intval) {
                    return _strp(_pointer.css('left'));
                } else {
                    _pointer.css('left', intval);
                    _checkPosition(_pointer);
                }
            },
            top: function(intval) {
                if (!intval) {
                    return _strp(_pointer.css('top'));
                } else {
                    _pointer.css('top', intval);
                    _checkPosition(_pointer);
                }
            },
            show: function(intval) {
                _pointer.css('display', '');
            },
            hide: function(intval) {
                _pointer.css('display', 'none');
            },
            toggle: function() {
                if (_pointer.css('display') == 'none') {
                    _pointer.css('display', '');
                } else {
                    _pointer.css('display', 'none');
                }
            }
        },
        setAll: function(l, t, w, h) {
            _mrq.css('left', l);
            _mrq.css('top', t);
            _mrq.width(w);
            _mrq.height(h);
            // _updateLocation(_mrq, _img);
            _checkDimensions(_mrq);
        }

    }
	
	// CONSTRUCTOR
	
	var _construct = function () {
		_createMarquee();
		_pointer = _addPointer();
		if (o.startDeslected) _deselect();
		/*if (layerId) {
			ImageToolsGlobal.marquees[layerId] = _return;
			_marqueeOrder = ImageToolsGlobal.marquees.length;
		} else {
			_marqueeOrder = ImageToolsGlobal.marquees.push(_return);
		}
		*/
		_marqueeOrder = ImageToolsGlobal.marquees.push(_return);
		if (o.selectOnly) _selectOnly();
	};
	_construct();
	
	return _return;
}
