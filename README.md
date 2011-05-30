A gauge rendered on a HTML5 canvas.

Minimal working example:

	var gauge = new Upp.Gauge();
	gauge.setValue(1);


To customize the gauge provide options as argument when creating a gauge.
An example specifying options:

	var options = {
		renderTo: 'realtime-gauge',
    	minValue: 0,
    	maxValue: 100,
    	startValue: 0,
        unit: " W",
        bounce : {
            decay: 2
        }
    };
    
    var gauge = new Upp.Gauge(options);
    
See function "getDefaultOptions" for all options.

