class Main

    _sceneHeight: null
    _sceneVector: null

    constructor: ->
        @_sceneHeight = new SceneHeight()
        @_sceneVector = new SceneVector()

        @_update()

    _update: =>
        @_sceneVector.update()
        @_sceneHeight.update()

        requestAnimationFrame @_update
        
new Main()
