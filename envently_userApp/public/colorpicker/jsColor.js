(function (window) {
	window.jsColorPicker = function(selectors, config) {
		var renderCallback = function(colors, mode) {
				var options = this,
					input = options.input,
					patch = options.patch,
					RGB = colors.RND.rgb,
					HSL = colors.RND.hsl,
					AHEX = options.isIE8 ? (colors.alpha < 0.16 ? '0' : '') +
						(Math.round(colors.alpha * 100)).toString(16).toUpperCase() + colors.HEX : '',
					RGBInnerText = RGB.r + ', ' + RGB.g + ', ' + RGB.b,
					RGBAText = 'rgba(' + RGBInnerText + ', ' + colors.alpha + ')',
					isAlpha = colors.alpha !== 1 && !options.isIE8,
					colorMode = input.getAttribute('data-colorMode');

				patch.style.cssText =
					// 'color:' + (colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd') + ';' + // Black...???
					// 'background-color:' + RGBAText + ';' +
					'filter:' + (options.isIE8 ? 'progid:DXImageTransform.Microsoft.gradient(' + // IE<9
						'startColorstr=#' + AHEX + ',' + 'endColorstr=#' + AHEX + ')' : '');

				input.value = (colorMode === 'HEX' && !isAlpha ? '#' + (options.isIE8 ? AHEX : colors.HEX) :
					colorMode === 'rgb' || (colorMode === 'HEX' && isAlpha) ?
					(!isAlpha ? 'rgb(' + RGBInnerText + ')' : RGBAText) :
					('hsl' + (isAlpha ? 'a(' : '(') + HSL.h + ', ' + HSL.s + '%, ' + HSL.l + '%' +
						(isAlpha ? ', ' + colors.alpha : '') + ')')
				);

				if (options.displayCallback) {
					options.displayCallback(colors, mode, options);
				}
			},
			actionCallback = function(event, action) {
				var options = this,
					colorPicker = colorPickers.current;

				if (action === 'toMemery') {
					var memos = colorPicker.nodes.memos,
						backgroundColor = '',
						opacity = 0,
						cookieTXT = [];

					for (var n = 0, m = memos.length; n < m; n++) {
						backgroundColor = memos[n].style.backgroundColor;
						opacity = memos[n].style.opacity;
						opacity = Math.round((opacity === '' ? 1 : opacity) * 100) / 100;
						cookieTXT.push(backgroundColor.
							replace(/, /g, ',').
							replace('rgb(', 'rgba(').
							replace(')', ',' + opacity + ')')
						);
					}
					cookieTXT = '\'' + cookieTXT.join('\',\'') + '\'';
					ColorPicker.docCookies('colorPickerMemos' + (options.noAlpha ? 'NoAlpha' : ''), cookieTXT);
				} else if (action === 'resizeApp') {
					ColorPicker.docCookies('colorPickerSize', colorPicker.color.options.currentSize);
				} else if (action === 'modeChange') {
					var mode = colorPicker.color.options.mode;

					ColorPicker.docCookies('colorPickerMode', mode.type + '-' + mode.z);
				}
			},
			createInstance = function(elm, config) {
				var initConfig = {
						klass: window.ColorPicker,
						input: elm,
						patch: elm,
						isIE8: !!document.all && !document.addEventListener, // Opera???
						// *** animationSpeed: 200,
						// *** draggable: true,
						margin: {left: -1, top: 2},
						customBG: '#FFFFFF',
						// displayCallback: displayCallback,
						/* --- regular colorPicker options from this point --- */
						color: elm.value,
						initStyle: 'display: none',
						mode: ColorPicker.docCookies('colorPickerMode') || 'hsv-h',
						// memoryColors: (function(colors, config) {
						// 	return config.noAlpha ?
						// 		colors.replace(/\,\d*\.*\d*\)/g, ',1)') : colors;
						// })($.docCookies('colorPickerMemos'), config || {}),
						memoryColors: ColorPicker.docCookies('colorPickerMemos' +
							((config || {}).noAlpha ? 'NoAlpha' : '')),
						size: ColorPicker.docCookies('colorPickerSize') || 1,
						renderCallback: renderCallback,
						actionCallback: actionCallback
					};

				for (var n in config) {
					initConfig[n] = config[n]; 
				}
				return new initConfig.klass(initConfig);
			},
			doEventListeners = function(elm, multiple, off) {
				var onOff = off ? 'removeEventListener' : 'addEventListener',
					focusListener = function(e) {
						var input = this,
							position = {left: input.offsetLeft, top: input.offsetTop},
							index = multiple ? Array.prototype.indexOf.call(elms, this) : 0,
							colorPicker = colorPickers[index] ||
								(colorPickers[index] = createInstance(this, config)),
							options = colorPicker.color.options,
							colorPickerUI = colorPicker.nodes.colorPicker;

						options.color = elm.value; // brings color to default on reset
						colorPickerUI.style.cssText = 
							'position: absolute;' +
							'left:' + (position.left + options.margin.left) + 'px;' +
							'top:' + (position.top + +input.offsetHeight + options.margin.top) + 'px;';

						if (!multiple) {
							options.input = elm;
							options.patch = elm; // check again???
							colorPicker.setColor(elm.value, undefined, undefined, true);
							colorPicker.saveAsBackground();
						}
						colorPickers.current = colorPickers[index];
						(options.appenTo || document.body).appendChild(colorPickerUI);
						setTimeout(function() { // compensating late style on onload in colorPicker
							colorPickerUI.style.display = 'block';
						}, 0);
					},
					mousDownListener = function(e) {
						var colorPicker = colorPickers.current,
							colorPickerUI = (colorPicker ? colorPicker.nodes.colorPicker : undefined),
							animationSpeed = colorPicker ? colorPicker.color.options.animationSpeed : 0,
							isColorPicker = function(elm) {
								while (elm) {
									if ((elm.className || '').indexOf('cp-app') !== -1) return elm;
									elm = elm.parentNode;
								}
								return false;
							}(e.target),
							inputIndex = Array.prototype.indexOf.call(elms, e.target);

						if (isColorPicker && Array.prototype.indexOf.call(colorPickers, isColorPicker)) {
							if (e.target === colorPicker.nodes.exit) {
								colorPickerUI.style.display = 'none';
								document.activeElement.blur();
							} else {
								// ...
							}
						} else if (inputIndex !== -1) {
							// ...
						} else {
							colorPickerUI.style.display = 'none';
						}
					};

				elm[onOff]('focus', focusListener);

				if (!colorPickers.evt || off) {
					colorPickers.evt = true; // prevent new eventListener for window

					window[onOff]('mousedown', mousDownListener);
					setTimeout(()=>{
						focusListener.bind(elm).call();
					},10);
				}
			},
			// this is a way to prevent data binding on HTMLElements
			// colorPickers = window.jsColorPicker.colorPickers || [],
			colorPickers = [],
			elms = document.querySelectorAll(selectors),
			testColors = new window.Colors({customBG: config.customBG, allMixDetails: true});

		window.jsColorPicker.colorPickers = colorPickers;

		for (var n = 0, m = elms.length; n < m; n++) {
			var elm = elms[n];

			if (config === 'destroy') {
				doEventListeners(elm, (config && config.multipleInstances), true);
				if (colorPickers[n]) {
					colorPickers[n].destroyAll();
				}
			} else {
				var value = elm.value.split('(');

				testColors.setColor(elm.value);
				if (config && config.init) {
					config.init(elm, testColors.colors);
				}
				elm.setAttribute('data-colorMode', value[1] ? value[0].substr(0, 3) : 'HEX');
				doEventListeners(elm, (config && config.multipleInstances), false);
				if (config && config.readOnly) {
					elm.readOnly = true;
				}
			}
		};

		return this;
	};


	if (window.colorPicker) {
		window.ColorPicker.docCookies = function(key, val, options) {
			var encode = encodeURIComponent, decode = decodeURIComponent,
				cookies, n, tmp, cache = {},
				days;

			if (val === undefined) { // all about reading cookies
				cookies = document.cookie.split(/;\s*/) || [];
				for (n = cookies.length; n--; ) {
					tmp = cookies[n].split('=');
					if (tmp[0]) cache[decode(tmp.shift())] = decode(tmp.join('=')); // there might be '='s in the value...
				}

				if (!key) return cache; // return Json for easy access to all cookies
				else return cache[key]; // easy access to cookies from here
			} else { // write/delete cookie
				options = options || {};

				if (val === '' || options.expires < 0) { // prepare deleteing the cookie
					options.expires = -1;
					// options.path = options.domain = options.secure = undefined; // to make shure the cookie gets deleted...
				}

				if (options.expires !== undefined) { // prepare date if any
					days = new Date();
					days.setDate(days.getDate() + options.expires);
				}

				document.cookie = encode(key) + '=' + encode(val) +
					(days            ? '; expires=' + days.toUTCString() : '') +
					(options.path    ? '; path='    + options.path       : '') +
					(options.domain  ? '; domain='  + options.domain     : '') +
					(options.secure  ? '; secure'                        : '');
			}
		};
	}


})(this);