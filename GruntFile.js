module.exports = function ( grunt ) {

    var srcCoffee = "src/coffee/"
    ,   deployJade = "deploy/"

    ,   coffeesToWatch = null
    ,   sassToWatch = null;

    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-coffee" );
    grunt.loadNpmTasks( "grunt-contrib-compass" );
    grunt.loadNpmTasks( "grunt-concurrent" );
    grunt.loadNpmTasks( "grunt-contrib-imagemin" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-browser-sync" );

    grunt.event.on( "watch", function( action, filepath ) {
        var fileType = getFileType( filepath );
        if( fileType == "coffee" ) {
            getCoffees();
            initConfig();
        }
    });

    function getFileType( filepath ) {
        return filepath.split( "." ).pop();
    }

    function getCoffees() {
        coffeesToWatch = [ srcCoffee + "*.coffee" ];

        grunt.file.recurse( srcCoffee, function( abspath, rootdir, subdir, filename ) {
            if( subdir == undefined )
                return;
            coffeesToWatch[ coffeesToWatch.length ] = srcCoffee + subdir + "/*.coffee";
        });

        coffeesToWatch.reverse();
    }

    function initConfig() {
        grunt.config.init( {
            pkg: grunt.file.readJSON('package.json'),

            watch: {
                coffee: {
                    files: [ "src/coffee/**/*.coffee" ],
                    tasks: [ "coffee:compile" ]
                },
                sass: {
                    files: [ "src/sass/**/*.scss" ],
                    tasks: [ "compass" ]
                }
            },

            browser_sync: {
                files: {
                    src: [ 
                        "deploy/css/**/*.css",
                        "deploy/js/**/*.js",
                        "deploy/img/*.jpg",
                        "deploy/img/*.png",
                        "deploy/*.html"
                    ]
                },
                options: {
                    server: {
                        baseDir: "deploy"
                    },
                    watchTask: true
                }
            },

            coffee: {
                compile: {
                    options: {
                        bare: true
                    },
                    files: {
                        "deploy/js/main.js": coffeesToWatch
                    }
                }
            },

            compass: {
                dist: {
                    options: {
                        config: "config.rb"
                    }
                }
            },

            imagemin: {
                dynamic: {
                    options: {
                        optimizationLevel: 7
                    },
                    files: [ {
                        expand: true,
                        cwd: "deploy/img/",
                        dest: "deploy/img/",
                        src: [ "**/*.{png,jpg}"]
                    }]
                }
            },

            uglify: {
                compile: {
                    files: {
                        "deploy/js/main.min.js": "deploy/js/main.js"
                    }
                }
            }
        });
    }

    getCoffees();
    initConfig();

    grunt.registerTask( "imageoptim", [ "imagemin:dynamic" ] );
    grunt.registerTask( "compile", [ "coffee:compile", "compass" ] )
    grunt.registerTask( "all", [ "coffee:compile", "compass", "uglify" ] )
    grunt.registerTask( "default", [ "compile", "browser_sync", "watch" ] );

    //grunt.task.run( "compile" );
}
