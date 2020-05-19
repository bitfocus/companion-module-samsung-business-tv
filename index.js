var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions();

	return self;
}

instance.prototype.choices_input = [
	{id: 0, label: 'PC',			code: 0x14},
	{id: 1, label: 'DVI',			code: 0x18},
	{id: 2, label: 'Input source',	code: 0x0C},
	{id: 3, label: 'MagicInfo', 	code: 0x20},
	{id: 4, label: 'DVI video', 	code: 0x1F},
	{id: 5, label: 'HDMI1', 		code: 0x21},
	{id: 6, label: 'HDMI1 PC', 		code: 0x22},
	{id: 7, label: 'HDMI2', 		code: 0x23},
	{id: 8, label: 'HDMI2 PC', 		code: 0x24},
	{id: 9, label: 'DisplayPort', 	code: 0x25}
];

instance.prototype.choices_mode = [
	{id: 0, label: '16:9',			code: 0x01},
	{id: 1, label: 'Zoom',			code: 0x04},
	{id: 2, label: 'Wide Zoom',		code: 0x31},
	{id: 3, label: '4:3',			code: 0x0B}
];

instance.prototype.choices_video_wall_mode = [
	{id: 0, label: 'Natural'},
	{id: 1, label: 'Full'}
]

instance.prototype.choices_onoff = [
	{id: 0, label: 'Off'},
	{id: 1, label: 'On'}
];

// Return config fields for web config
instance.prototype.config_fields = function() {
	var self = this;

	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 5,
			regex: self.REGEX_IP
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port (Default: 1515)',
			width: 3,
			default: 1515,
			regex: self.REGEX_PORT
		}
	];
}

instance.prototype.init = function() {
	var self = this;

	self.init_variables();
	self.init_presets();
	self.init_feedbacks();
}

instance.prototype.destroy = function() {
	var self = this;
}

instance.prototype.init_variables = function () {
	var self = this;
	var variables = [
		{
			label: 'Power State',
			name: 'power'
		},
		{
			label: 'Picture In Picture',
			name: 'pip'
		},
		{
			label: 'Safety Lock',
			name: 'safety_lock'
		},
		{
			label: 'Video Wall',
			name: 'video_wall'
		},
		{
			label: 'Video Wall Mode',
			name: 'video_wall_mode'
		},
		{
			label: 'Volume',
			name: 'volume'
		},
		{
			label: 'Mode',
			name: 'mode'
		},
		{
			label: 'Input',
			name: 'input'
		}
	];

	self.setVariableDefinitions(variables);
}

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var size = '18';

	for (var input in self.choices_input) {
		presets.push({
			category: 'Inputs',
			label: self.choices_input[input].label,
			bank: {
				style: 'text',
				size: size,
				text: self.choices_input[input].label,
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{
				action: 'input',
				options: {
					action: self.choices_input[input].id
				}
			}],
			feedbacks: [{
				type: 'input',
				options: {
					input: self.choices_input[input].id,
					background_active: self.rgb(0, 0, 255),
					background_inactive: self.rgb(0,0,0),
					foreground_active: self.rgb(255,255,255),
					foreground_inactive: self.rgb(255, 255, 255)
				}
			}]
		});
	}

	for (var mode in self.choices_mode) {
		presets.push({
			category: 'Modes',
			label: self.choices_mode[mode].label,
			bank: {
				style: 'text',
				size: size,
				text: self.choices_mode[mode].label,
				color: self.rgb(255, 255, 255),
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{
				action: 'mode',
				options: {
					action: self.choices_mode[mode].id
				}
			}],
			feedbacks: [{
				type: 'mode',
				options: {
					mode: self.choices_mode[mode].id,
					background_active: self.rgb(0, 0, 255),
					background_inactive: self.rgb(0,0,0),
					foreground_active: self.rgb(255,255,255),
					foreground_inactive: self.rgb(255, 255, 255)
				}
			}]
		});
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.init_feedbacks = function () {
	var self = this;
	var feedbacks = {};

	var backgroundForegroundActiveOptions = [{
		type: 'colorpicker',
		label: 'foreground and background color active',
		id: 'bg_active',
		default: this.rgb(0, 0, 255)
	},
	{
		type: 'colorpicker',
		label: 'Foreground color active',
		id: 'fg_active',
		default: this.rgb(255, 255, 255)
	},
	{
		type: 'colorpicker',
		label: 'foreground and background color inactive',
		id: 'bg_inactive',
		default: this.rgb(0, 0, 0)
	},
	{
		type: 'colorpicker',
		label: 'Foreground color inactive',
		id: 'fg_inactive',
		default: this.rgb(255, 255, 255)
	}];

	feedbacks['input'] = {
		label: 'Input change',
		description: 'Changes the foreground and background color of the bank to the active colors if the input changes to the defined input, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				choices: self.choices_input,
				default: 0
			}
		]
	};

	feedbacks['mode'] = {
		label: 'Mode change',
		description: 'Changes the foreground and background color of the bank to the active colors if the mode changes to the defined mode, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Mode',
				id: 'mode',
				choices: self.choices_mode,
				default: 0
			}
		]
	};

	feedbacks['video_wall_mode'] = {
		label: 'Video Wall change',
		description: 'Changes the foreground and background color of the bank to the active colors if the mode changes to the defined mode, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Mode',
				id: 'mode',
				choices: self.choices_mode,
				default: 0
			}
		]
	};

	feedbacks['volume'] = {
		label: 'Volume change',
		description: 'Changes the foreground and background color of the bank to the active colors if the volume changes to the defined volume, otherwise the inactive colors are used',
		options: [
			{
				type: 'number',
				label: 'Volume',
				id: 'volume',
				default: 50,
				min: 0,
				max: 100
			}
		]
	};

	feedbacks['size'] = {
		label: 'Size change',
		description: 'Changes the foreground and background color of the bank to the active colors if the size changes to the defined size, otherwise the inactive colors are used',
		options: [
			{
				type: 'number',
				label: 'Size',
				id: 'size',
				default: 128,
				min: 0,
				max: 255
			}
		]
	};

	feedbacks['power'] = {
		label: 'Power state change',
		description: 'Changes the foreground and background color of the bank to the active colors if the power configuration changes to the defined state, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Power state',
				id: 'state',
				choices: self.choices_onoff,
				default: 0
			}
		]
	};

	feedbacks['pip'] = {
		label: 'Picture in Picture state change',
		description: 'Changes the foreground and background color of the bank to the active colors if the pciture in picture configuration changes to the defined state, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Picture in Picture state',
				id: 'state',
				choices: self.choices_onoff,
				default: 0
			}
		]
	};

	feedbacks['safety'] = {
		label: 'Safety Lock state change',
		description: 'Changes the foreground and background color of the bank to the active colors if the safety lock configuration changes to the defined state, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Safety Lock state',
				id: 'state',
				choices: self.choices_onoff,
				default: 0
			}
		]
	};

	feedbacks['video_wall'] = {
		label: 'Video Wall state change',
		description: 'Changes the foreground and background color of the bank to the active colors if the video wall configuration changes to the defined state, otherwise the inactive colors are used',
		options: [
			{
				type: 'dropdown',
				label: 'Video Wall state',
				id: 'state',
				choices: self.choices_onoff,
				default: 0
			}
		]
	};

	for (var key in feedbacks) {
		feedbacks[key].options = backgroundForegroundActiveOptions.concat(feedbacks[key].options);
	}

	self.setFeedbackDefinitions(feedbacks);
}

instance.prototype.actions = function() {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'power_on': {label: 'Power On'},
		'power_off': {label: 'Power Off'},
		'pip_on': {label: 'Picture in Picture On'},
		'pip_off': {label: 'Picture in Picture Off'},
		'wall_on': {label: 'Video Wall On'},
		'wall_off': {label: 'Video Wall Off'},
		'wall_full': {label: 'Video Wall Mode Full'},
		'wall_natural': {label: 'Video Wall Mode Natural'},
		'safety_on': {label: 'Safety Lock On'},
		'safety_off': {label: 'Safety Lock Off'},
		'volume': {
			label: 'Set Volume',
			options: [
				{
					type: 'number',
					id: 'action',
					label: 'Volume 0-100%',
					min: 1,
					max: 100,
					default: 50,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'input': {
			label: 'Set Input Source',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Source',
					default: 0,
					choices: self.choices_input
				},
			]
		},
		'mode': {
			label: 'Set Screen Mode',
			options: [
				{
					type: 'dropdown',
					id: 'action',
					label: 'Mode',
					default: 0,
					choices: self.choices_mode
				},
			]
		},
		'size': {
			label: 'Set Screen Size',
			options: [
				{
					type: 'number',
					id: 'action',
					label: 'Screen Size (inch)',
					min: 0,
					max: 255,
					default: 128,
					required: true,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
}

instance.prototype.feedback = function(feedback) {
	var self = this;
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;