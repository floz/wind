class SceneHeight

    _canvas: null
    _ctx: null
    _textDisplacement: null
    _textTest: null
    _textW: 0
    _textH: 0
    _orientation: 0.0

    _renderer: null
    _camera: null
    _scene: null
    _plane: null
    _uniforms: null
    _texture: null

    _size: 512

    constructor: ->
        @_canvas = document.getElementById "wind_height_map"
        @_ctx = @_canvas.getContext "2d"
        @_textDisplacement = document.getElementById "texture--displacement"
        @_textTest = document.getElementById "texture--test"
        @_textW = @_textDisplacement.width
        @_textH = @_textDisplacement.height

        @_ctx.fillStyle = "rgba( 128, 128, 128, 1 )"
        @_ctx.fillRect 0, 0, @_size, @_size

        @_initScene3D()

    _initScene3D: ->
        @_renderer = new THREE.WebGLRenderer alpha: false
        @_renderer.setClearColor 0x444444
        @_renderer.setSize 512, 512

        container = document.getElementById "wind_height_map_3d"
        container.appendChild @_renderer.domElement

        @_camera = new THREE.PerspectiveCamera 45, 1, 1, 10000
        @_camera.position.set 0, 0, 0

        @_scene = new THREE.Scene()

        ambient = new THREE.AmbientLight 0x0000ff
        @_scene.add ambient

        geom = new THREE.PlaneGeometry 512, 512, 10, 10
        mat = @_getMaterial()#new THREE.MeshBasicMaterial { wireframe: true, color: 0xff00ff }
        @_plane = new THREE.Mesh geom, mat
        @_plane.position.z = -1000
        # @_plane.rotation.x = 100
        # @_plane.rotation.y = 100
        @_scene.add @_plane

    _getMaterial: ->
        shader = new SceneHeightShader()
        @_uniforms = shader.uniforms

        params = 
            fragmentShader: shader.fragmentShader
            vertexShader: shader.vertexShader
            uniforms: @_uniforms

        @_texture = new THREE.Texture @_canvas
        @_uniforms.uText.value = @_texture

        return new THREE.ShaderMaterial params

    update: ->
        lmx = stage.lastMouse.x - 512
        lmy = stage.lastMouse.y
        mx = stage.mouse.x - 512
        my = stage.mouse.y

        dx = mx - lmx
        dy = my - lmy
        orientation = Math.atan2 dy, dx
        length = Math.sqrt dx * dx + dy * dy

        # @_orientation += ( orientation - @_orientation ) * .2
        @_orientation = orientation

        @_ctx.drawImage @_canvas, 0, 0
        @_ctx.fillStyle = "rgba( 128, 128, 128, 1 )"
        @_ctx.fillRect 0, 0, @_size, @_size

        @_ctx.save()
        @_ctx.translate mx, my
        # @_ctx.rotate @_orientation
        @_ctx.drawImage @_textDisplacement, -@_textW >> 1, -@_textH >> 1
        @_ctx.restore()

        @_texture.needsUpdate = true
        @_renderer.render @_scene, @_camera



