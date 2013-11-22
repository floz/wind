class Main

    _sceneHeight: null
    _sceneVector: null
    _stats: null

    constructor: ->
        @_sceneHeight = new SceneHeight()
        @_sceneVector = new SceneVector()

        @_stats = new Stats()
        @_stats.domElement.style.position = "absolute"
        @_stats.domElement.style.right = "0"
        @_stats.domElement.style.top = "0"
        @_stats.domElement.style.zIndex = 100
        document.body.appendChild @_stats.domElement

        @_update()

    _update: =>
        @_sceneVector.update()
        @_sceneHeight.update()

        @_stats.update()

        requestAnimationFrame @_update
        
new Main()
