
/**
* Convenience function for converting degrees to radians
* @param value An angle in degrees
* @return An angle in radians
*/
function degreesToRadians(value) {
    return Math.PI / 180 * value;
}


/**
 * Overwrite current options with new options (recursively)
 * @param existingOptions
 * @param newOptions
 */
function overwriteOptions(existingOptions, newOptions) {
    for (var key in newOptions) {
        if (typeof(newOptions[key]) == 'object') {
            overwriteOptions(existingOptions[key], newOptions[key]);
        }
        else {
            existingOptions[key] = newOptions[key];
        }
    }
}


var Upp = {

    /**
     * Constructs a new gauge using the options provided
     * @param options Parameters for the chart
     */
    Gauge: function(options) {

        /**
         * Redraw the whole gauge
         */
        this.redraw = function() {
            this.drawGauge();
            this.drawNeedle();
        }


        /**
         * Return the default options
         */
        this.getDefaultOptions = function() {

            // Create default options
            var options = {
                minValue: 0,
                maxValue: 1,
                startValue: 0,
                unit: "",
                minAngle: 60,
                maxAngle: 300,
                majorTickStep: 15,
                minorTickStep: 5,
                renderTo : 'realtime-gauge',
                bounce : {
                    freq: 3,
                    amplitude: 0.1,
                    decay: 3.0
                }
            }

            // Return the default options
            return options;
        }


        /**
         * Return the options
         */
        this.getOptions = function() {
            return this.options;
        }


        /**
         * Set new options
         */
        this.setOptions = function(newOptions) {
            overwriteOptions(this.options, newOptions);
        }


        /**
         * Set a value
         */
        this.setValue = function(value) {

            // Make sure value is considered a number
            var newValue = value * 1.0;

            // Check given value
            if (this.options.minValue <= newValue <= this.options.maxValue) {
                // Apply new value
                this.moveToValue(newValue);
            }
        }


        /**
         * Get value
         */
        this.getValue = function() {
            return this.currentValue;
        }


        /**
         * Draw the gauge
         */
        this.drawGauge = function() {
            // Retrieve context
            var c   = document.getElementById(this.options.renderTo);
            var ctx = c.getContext("2d");

            // Calculate much used variables
            var centerX = c.width  / 2;
            var centerY = c.height / 2;
            var outerRadius = Math.min(centerX, centerY);

            // Save canvas, will be restored later. This will ensure painting all at once to avoid flicker
            ctx.save();

            // Draw edge (outer circle)
            ctx.beginPath();
            var grdEdge = ctx.createRadialGradient(centerX, centerY, outerRadius * 0.9, centerX, centerY, outerRadius);
            grdEdge.addColorStop(1.0, '#AAAAAA');
            grdEdge.addColorStop(0.0, '#FEFEFE');
            ctx.fillStyle = grdEdge;
            ctx.arc(centerX, centerY, outerRadius, 0, degreesToRadians(360), true);
            ctx.fill();

            // Fill circle (black)
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.arc(centerX, centerY, outerRadius * 0.9, 0, degreesToRadians(360), true);
            ctx.fill();

            // Draw colored round scale
            ctx.beginPath();
            var grdScale = ctx.createLinearGradient(centerX - outerRadius, 0, centerX + outerRadius, 0);
            grdScale.addColorStop(0.1,"#FF0000");
            grdScale.addColorStop(0.42,"#FFFF00");
            grdScale.addColorStop(0.58,"#FFFF00");
            grdScale.addColorStop(0.9,"#00FF00");
            ctx.fillStyle = grdScale;
            ctx.arc(centerX, centerY, outerRadius * 0.85, 0, degreesToRadians(360), false);
            ctx.fill();

            // Fill center of dial (black)
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.arc(centerX, centerY, outerRadius * 0.75, 0, degreesToRadians(360), true);
            ctx.fill();

            // Fill bottom of dial (black) with a pie-shaped area
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.moveTo(centerX, centerY);
            ctx.arc   (centerX, centerY, outerRadius * 0.87, degreesToRadians(this.options.minAngle + 90), degreesToRadians(this.options.maxAngle + 90), true);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            // Draw tick line
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#FFFFFF";
            ctx.arc(centerX, centerY, outerRadius * 0.70, degreesToRadians(this.options.minAngle + 90), degreesToRadians(this.options.maxAngle + 90), false);

            // Draw tick markers
            for (var i = this.options.minAngle; i <= this.options.maxAngle; i++) {
                if (i % this.options.majorTickStep == 0 ||
                    i % this.options.minorTickStep == 0) {

                    // Calculate angle in radians
                    var angle = degreesToRadians(i);

                    // Calculate canvas coordinates for line
                    var dx1 = Math.sin(angle) * outerRadius * 0.70;
                    var dy1 = Math.cos(angle) * outerRadius * 0.70;
                    var dx2 = Math.sin(angle) * outerRadius * 0.65;
                    var dy2 = Math.cos(angle) * outerRadius * 0.65;

                    if (i % this.options.majorTickStep == 0) {
                        dx2 = Math.sin(angle) * outerRadius * 0.60;
                        dy2 = Math.cos(angle) * outerRadius * 0.60;
                    }

                    // Move to one end-point
                    ctx.moveTo(centerX + dx1, centerY + dy1);
                    // Create line from end-point to other end-point
                    ctx.lineTo(centerX + dx2, centerY + dy2);
                }
            }

            // Draw the tick line and tick markers
            ctx.stroke();

            // Draw text
            ctx.textBaseline = "top";
            ctx.font = "16px Verdana Bold";
            ctx.fillStyle = "#FFFFFF";

            ctx.textAlign = "right";
            var dxMax = Math.sin(degreesToRadians(this.options.minAngle)) * (outerRadius * 0.5);
            var dyMax = Math.cos(degreesToRadians(this.options.minAngle)) * (outerRadius * 0.5);
            ctx.fillText(this.options.maxValue, centerX + dxMax + outerRadius * 0.15, centerY + dyMax + outerRadius * 0.15);

            ctx.textAlign = "left";
            var dxMin = Math.sin(degreesToRadians(this.options.maxAngle)) * (outerRadius * 0.5);
            var dyMin = Math.cos(degreesToRadians(this.options.maxAngle)) * (outerRadius * 0.5);
            ctx.fillText(this.options.minValue, centerX + dxMin - outerRadius * 0.15, centerY + dyMin + outerRadius * 0.15);

            // Restore canvas (performs drawing)
            ctx.restore();
        }


        /**
         * Draw the needle
         */
        this.drawNeedle = function() {

            // Get canvas and context
            var c   = document.getElementById(this.options.renderTo);
            var ctx = c.getContext("2d");

            // Calculate much used variables
            var centerX = c.width  / 2;
            var centerY = c.height / 2;
            var outerRadius = Math.min(centerX, centerY);

            var needleWidth = outerRadius * 0.02;
            var needleLength = outerRadius * 0.5;

            var textAreaLeft = centerX * 0.6;
            var textAreaBottom = c.height * 0.8;
            var textAreaWidth  = centerX * 0.8;
            var textAreaHeight = 18;

            // Save canvas, will be restored later. This will ensure painting all at once to avoid flicker
            ctx.save();

            // Fill center (black)
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.arc(centerX, centerY, outerRadius * 0.55, degreesToRadians(this.options.minAngle - 15 + 90), degreesToRadians(this.options.maxAngle + 15 + 90), false);
            ctx.fill();

            // Normalize current value (between 0..1)
            var normalizedValue = (1.0 / (this.options.maxValue - this.options.minValue)) * (this.currentValue - this.options.minValue);

            // Calculate the needle angle
            var angle = (normalizedValue * (this.options.maxAngle - this.options.minAngle)) + this.options.minAngle;

            // Clear text area (black)
            ctx.fillRect(textAreaLeft, textAreaBottom, textAreaWidth, textAreaHeight);

            // Draw text
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.font = "16px Verdana Bold";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(this.currentValue.toFixed(1) + this.options.unit, centerX, textAreaBottom, textAreaWidth);

            // Store the current text value, used for erasing
            this.previousTextValue = this.currentValue;

            // Translate and Rotate canvas
            ctx.translate(centerX, centerY);
            ctx.rotate(degreesToRadians(angle)); //rotate in origin

            // Draw needle
            ctx.beginPath();
            ctx.fillStyle = "#FFFFFF";
            ctx.moveTo(-needleWidth, 0);
            ctx.lineTo( needleWidth, 0);
            ctx.lineTo( 0, needleLength);
            ctx.fill();

            // Restore canvas
            ctx.restore();
        }


        /**
         * Move the needle to a new value
         * @param newValue
         */
        this.moveToValue = function(newValue) {

            // Store current value
            var previousValue = this.currentValue;

            // Calculate difference
            var diff = newValue - previousValue;

            // Check if value is changed
            if (Math.abs(diff) == 0) {
                return;
            }

            // Check if we are already moving to a new value
            if (this.timerId > 0) {
                // Stop current movement
                clearInterval(this.timerId);

                // Reset timer id
                this.timerId = 0;
            }

            // Calculate time step based on difference
            var timeStep = 0.01 * ((this.options.maxValue - this.options.minValue) / Math.abs(diff));

            // Save reference to this for use in the anonymous interval function
            var self = this;

            // Set start time
            var time = 0;

            // Start interval timer with an interval of 10 msec
            this.timerId = setInterval(function() {
                // Keep running while time < 1
                if (time < 1) {
                    // Increment with timeStep
                    time += timeStep;

                    // Calculate increase value using a simple acceleration profile
                    var moveValue = (1 - Math.cos(0.25 * time * 2 * Math.PI)) * diff;

                    // Calculate new current value
                    self.currentValue = previousValue + moveValue;

                    // Draw the needle
                    self.drawNeedle();
                }
                // Time's up, new value should be reached
                else {
                    // Stop the timer
                    clearInterval(self.timerId);

                    // Reset time id
                    self.timerId = 0;

                    // Set current value to the exact newValue (there's a chance for small deviation due to rounding errors)
                    self.currentValue = newValue;

                    // Draw the needle
                    self.drawNeedle();

                    // Start bounce effect
                    self.bounceAtValue(diff);
                }
            }, 10);
        }


        /**
         * Let the needle bounce for one second at the current value
         * @param diff Defines the direction in which to start bouncing, the amplitude and decay of the bounces
         */
        this.bounceAtValue = function(diff) {

            // Bounce parameters
            var freq      = this.options.bounce.freq;
            var amplitude = this.options.bounce.amplitude * Math.abs(diff);
            var decay     = this.options.bounce.decay * ((this.options.maxValue - this.options.minValue) / Math.abs(diff));

            // Save current value
            var previousValue = this.currentValue;

            // Save a reference to this for use in the anonymous interval function
            var self = this;

            // Set start time
            var time = 0;

            // Start interval timer with a interval of 10 msec
            this.timerId = setInterval(function() {
                // Keep running while time < 1
                if (time < 1) {
                    // Increment time
                    time += 0.01;

                    // Calculate bounce value
                    var bounceValue = Math.sin(freq * time * 2 * Math.PI) / Math.exp(decay * time) * amplitude;

                    // Apply bounce value
                    if (diff < 0) self.currentValue = previousValue - bounceValue;
                    else          self.currentValue = previousValue + bounceValue;
                }
                // Time's up
                else {
                    // Stop timer
                    clearInterval(self.timerId);

                    // Reset timer id
                    self.timerId = 0;

                    // Make sure to apply the previous value
                    self.currentValue = previousValue;
                }
                // Draw the needle
                self.drawNeedle();
            }, 10);
        }

        // Reset timer id
        this.timerId = 0;

        // Apply default options
        this.options = this.getDefaultOptions();

        // Apply provided options
        this.setOptions(options);

        // Set start value
        this.currentValue = this.options.startValue;

        // Draw the gauge
        this.redraw();
    }

};
