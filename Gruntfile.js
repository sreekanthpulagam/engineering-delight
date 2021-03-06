/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({
		
		// Main watch task. Kick this off by entering `grunt watch`. Now, any time you change the files below,
		// the relevant tasks will execute
		watch: {
			sass: {
				files: 'src/styles/**/*.scss',
				tasks: 'sass:dev',
				interrupt: true
			},
			data: {
				files: 'src/data/**/*',
				tasks: 'dir2json:dev',
				interrupt: true
			},
			files: {
				files: 'src/files/**/*',
				tasks: 'copy:filesdev',
				interrupt: true
			},
			root: {
				files: 'src/*.*',
				tasks: 'copy:rootdev',
				interrupt: true
			},
			js: {
				files: 'src/js/**',
				tasks: 'copy:jsdev',
				interrupt: true
			}
		},


		// Lint .js files in the src/js folder
		jshint: {
			files: ['src/js/**/*.js', 
			//exclude these files:
			'!src/js/almond.js', '!src/js/require.js', '!src/js/lib/**/*.js'],
			options: { jshintrc: '.jshintrc' }
		},

		
		// Clean up old cruft
		clean: {
			tmp: [ 'tmp' ],
			build: [ 'build' ],
			generated: [ 'generated' ]
		},


		// Compile .scss files
		sass: {
			dev: {
				files: {
					'generated/styles/min.css': 'src/styles/**/*.scss'
				},
				options: { debugInfo: true }
			},
			build: {
				files: {
					'build/styles/min.css': 'src/styles/**/*.scss'
				},
				options: { style: 'compressed' }
			}
		},
		
		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'build/js/',
					out: 'build/js/main.js',
					name: 'almond',
					include: 'main',
					mainConfigFile: 'build/js/main.js',
					wrap: true,
					optimize: 'uglify2',
					uglify2: {
						compress: {
							dead_code: true,
							conditionals: true // e.g. rewrite `if ( <%= production %> ) { doX(); } else { doY() }` as `doX()`
						}
					}
				}
			}
		},

		// Copy files
		copy: {
			files: {
				files: [{
					expand: true,
					cwd: 'src/files',
					src: ['**'],
					dest: 'build/files/'
				}]
			},
			root: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.*'],
					dest: 'build/'
				}]
			},
			js: {
				files: [{
					expand: true,
					cwd: 'src/js',
					src: ['**'],
					dest: 'build/js'
				}]
			},
			filesdev: {
				files: [{
					expand: true,
					cwd: 'src/files',
					src: ['**'],
					dest: 'generated/files/'
				}]
			},
			rootdev: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.*'],
					dest: 'generated/'
				}]
			},
			jsdev: {
				files: [{
					expand: true,
					cwd: 'src/js',
					src: ['**'],
					dest: 'generated/js'
				}]
			},
		},

		// Compress any CSS in the root folder
		cssmin: {
			build: {
				files: [{
					expand: true,
					cwd: 'tmp/build/',
					src: '*.css',
					dest: 'build/'
				}]
			}
		},

		// Minify any JS in the root folder
		uglify: {
			build: {
				files: [{
				expand: true,
				cwd: 'build/',
				src: '*.js',
				dest: 'build/'}]
			}
		},
		
		// Combine contents of `src/data` into a single `data.json` file
		dir2json: {
			dev: {
				root: 'src/data/',
				dest: 'generated/js/data.js',
				options: { space: '\t', amd: true }
			},
			build: {
				root: 'src/data/',
				dest: 'build/js/data.js',
				options: { amd: true }
			}
		}

	});


	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-dir2json');
	

	
	// generate a runnable build for developing
	grunt.registerTask( 'generate', [
		'copy:rootdev',
		'copy:jsdev',
		'copy:filesdev',
		'sass:dev',
		'dir2json:dev'
	]);

	// default task - generate dev build and watch for changes
	grunt.registerTask( 'default', [
		'generate',
		'watch'
	]);

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [
		// clear out previous build
		'clean:build',
		'clean:tmp',

		//Lint js files!
		//'jshint',

		// copy files from project/files to build/files and from project root to build root
		'copy:root',
		'copy:js',
		'copy:files',

		// build our min.css, without debugging info
		'sass:build',
		'dir2json:build',

		// optimise JS
		'requirejs',

		// optimise JS and CSS from the root folder
		'cssmin:build',
		'uglify:build',

	]);

};
