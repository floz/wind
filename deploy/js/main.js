var SceneVector, Vector;

SceneVector = (function() {
  SceneVector.prototype._canvas = null;

  SceneVector.prototype._ctx = null;

  SceneVector.prototype._size = 0;

  SceneVector.prototype._sizeTile = 0;

  SceneVector.prototype._step = 50;

  SceneVector.prototype._vectors = null;

  SceneVector.prototype._renderer = null;

  SceneVector.prototype._camera = null;

  SceneVector.prototype._scene = null;

  SceneVector.prototype._mat = null;

  SceneVector.prototype._plane = null;

  SceneVector.prototype._uniforms = null;

  SceneVector.prototype._aOrientation = null;

  SceneVector.prototype._aLength = null;

  function SceneVector() {
    this._canvas = document.getElementById("wind_vector");
    this._ctx = this._canvas.getContext("2d");
    this._size = this._canvas.width;
    this._sizeTile = this._size / this._step;
    this._createVectors();
    this._initScene3D();
  }

  SceneVector.prototype._createVectors = function() {
    var i, j, mid, px, py, _i, _j, _ref, _ref1;
    this._vectors = [];
    mid = this._sizeTile >> 1;
    px = 0;
    py = 0;
    for (i = _i = 0, _ref = this._step; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = this._step; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        this._vectors.push(new Vector(px + mid, py + mid));
        px += this._sizeTile;
      }
      px = 0;
      py += this._sizeTile;
    }
    console.log(this._vectors.length);
  };

  SceneVector.prototype._initScene3D = function() {
    var ambient, container, geom, point;
    this._renderer = new THREE.WebGLRenderer({
      alpha: false
    });
    this._renderer.setClearColor(0x444444);
    this._renderer.setSize(512, 512);
    container = document.getElementById("wind_vector_3d");
    container.appendChild(this._renderer.domElement);
    this._camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    this._camera.position.set(0, 0, 0);
    this._scene = new THREE.Scene();
    ambient = new THREE.AmbientLight(0x444444);
    this._scene.add(ambient);
    point = new THREE.PointLight(0x00ff00, 1, 2000);
    point.position.x = 100;
    point.position.y = 0;
    point.position.z = -1000;
    this._scene.add(point);
    geom = new THREE.PlaneGeometry(512, 512, this._step, this._step);
    this._mat = this._getMaterial();
    this._plane = new THREE.Mesh(geom, this._mat);
    this._plane.position.z = -1000;
    this._plane.rotation.y = 1;
    this._plane.receiveShadows = true;
    return this._scene.add(this._plane);
  };

  SceneVector.prototype._getMaterial = function() {
    var params, shader;
    shader = new SceneVectorShader();
    this._uniforms = shader.uniforms;
    this._attributes = shader.attributes;
    params = {
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: this._uniforms,
      attributes: this._attributes,
      lights: true,
      color: 0xff00ff,
      wireframe: true,
      shading: THREE.FlatShading
    };
    this._aOrientation = this._attributes.aOrientation.value;
    this._aLength = this._attributes.aLength.value;
    return new THREE.ShaderMaterial(params);
  };

  SceneVector.prototype.update = function() {
    this._updateVector();
    this._ctx.fillStyle = "#000";
    this._ctx.fillRect(0, 0, this._size, this._size);
    this._drawGrid();
    this._drawVector();
    return this._renderer.render(this._scene, this._camera);
  };

  SceneVector.prototype._updateVector = function() {
    var dist, dx, dy, i, length, orientation, ratio, vector, _i, _len, _ref;
    dx = stage.mouse.x - stage.lastMouse.x;
    dy = stage.mouse.y - stage.lastMouse.y;
    orientation = Math.atan2(dy, dx);
    length = Math.sqrt(dx * dx + dy * dy);
    _ref = this._vectors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      vector = _ref[i];
      dx = stage.mouse.x - vector.x;
      dy = stage.mouse.y - vector.y;
      dist = Math.sqrt(dx * dx + dy * dy);
      ratio = Math.max(0, Math.min(dist / 100, 1));
      ratio = this._bellCurve(ratio * 2);
      vector.add(orientation, length, ratio);
      vector.update();
      this._aOrientation[i] = vector.orientation;
      this._aLength[i] = vector.length;
    }
    return this._attributes.aLength.needsUpdate = true;
  };

  SceneVector.prototype._bellCurve = function(value) {
    var f;
    f = (value / 2) * 1.5;
    if (f > -1.5 && f < -0.5) {
      return 0.5 * Math.pow(f + 1.5, 2.0);
    } else if (f > -0.5 && f < 0.5) {
      return 3.0 / 4.0 - (f * f);
    } else if (f > 0.5 && f < 1.5) {
      return 0.5 * Math.pow(f - 1.5, 2.0);
    }
    return 0.0;
  };

  SceneVector.prototype._drawGrid = function() {
    var i, idx, _i, _ref;
    idx = 0;
    this._ctx.strokeStyle = "#444";
    this._ctx.beginPath();
    for (i = _i = 0, _ref = this._step; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      this._ctx.moveTo(0, idx);
      this._ctx.lineTo(this._size, idx);
      this._ctx.moveTo(idx, 0);
      this._ctx.lineTo(idx, this._size);
      idx += this._sizeTile;
    }
    return this._ctx.stroke();
  };

  SceneVector.prototype._drawVector = function() {
    var vector, _i, _len, _ref;
    this._ctx.strokeStyle = "#f00";
    this._ctx.beginPath();
    _ref = this._vectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vector = _ref[_i];
      this._ctx.moveTo(vector.x, vector.y);
      this._ctx.lineTo(vector.getDirection().x, vector.getDirection().y);
    }
    return this._ctx.stroke();
  };

  return SceneVector;

})();

Vector = (function() {
  Vector.prototype.x = 0;

  Vector.prototype.y = 0;

  Vector.prototype.orientation = 0.0;

  Vector.prototype.length = 0.0;

  Vector.prototype.direction = {
    x: 0.0,
    y: 0.0
  };

  Vector.prototype._needUpdate = true;

  function Vector(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector.prototype.add = function(orientation, length, ratio) {
    this.orientation += (orientation - this.orientation) * ratio;
    this.length += (length - this.length) * ratio;
    return this._needUpdate = true;
  };

  Vector.prototype.update = function() {
    return this.length += (0.0 - this.length) * .07;
  };

  Vector.prototype.getDirection = function() {
    if (!this._needUpdate) {
      return this.direction;
    }
    this.direction.x = this.x + Math.cos(this.orientation) * this.length;
    this.direction.y = this.y + Math.sin(this.orientation) * this.length;
    if (this.direction.x === this.x && this.direction.y === this.y) {
      this.direction.x = this.x + 1;
    }
    return this.direction;
  };

  return Vector;

})();

var SceneVectorShader;

SceneVectorShader = (function() {
  function SceneVectorShader() {}

  SceneVectorShader.prototype.attributes = {
    aOrientation: {
      type: "f",
      value: []
    },
    aLength: {
      type: "f",
      value: []
    }
  };

  SceneVectorShader.prototype.uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["common"], THREE.UniformsLib["fog"], THREE.UniformsLib["lights"], THREE.UniformsLib["shadowmap"], {
      "ambient": {
        type: "c",
        value: new THREE.Color(0xffffff)
      },
      "emissive": {
        type: "c",
        value: new THREE.Color(0x000000)
      },
      "wrapRGB": {
        type: "v3",
        value: new THREE.Vector3(1, 1, 1)
      }
    }
  ]);

  SceneVectorShader.prototype.vertexShader = ["#define LAMBERT", "varying vec3 vLightFront;", "attribute float aLength;", "#ifdef DOUBLE_SIDED", "varying vec3 vLightBack;", "#endif", THREE.ShaderChunk["map_pars_vertex"], THREE.ShaderChunk["lightmap_pars_vertex"], THREE.ShaderChunk["envmap_pars_vertex"], THREE.ShaderChunk["lights_lambert_pars_vertex"], THREE.ShaderChunk["color_pars_vertex"], THREE.ShaderChunk["morphtarget_pars_vertex"], THREE.ShaderChunk["skinning_pars_vertex"], THREE.ShaderChunk["shadowmap_pars_vertex"], "void main() {", THREE.ShaderChunk["map_vertex"], THREE.ShaderChunk["lightmap_vertex"], THREE.ShaderChunk["color_vertex"], THREE.ShaderChunk["morphnormal_vertex"], THREE.ShaderChunk["skinbase_vertex"], THREE.ShaderChunk["skinnormal_vertex"], THREE.ShaderChunk["defaultnormal_vertex"], THREE.ShaderChunk["morphtarget_vertex"], THREE.ShaderChunk["skinning_vertex"], "vec4 mvPosition;", "#ifdef USE_SKINNING", "mvPosition = modelViewMatrix * skinned;", "#endif", "#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )", "mvPosition = modelViewMatrix * vec4( morphed, 1.0 );", "#endif", "#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )", "vec4 pos = vec4( position, 1.0 );", "pos.z -= aLength * 2.0;", "mvPosition = modelViewMatrix * pos;", "#endif", "gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk["worldpos_vertex"], THREE.ShaderChunk["envmap_vertex"], THREE.ShaderChunk["lights_lambert_vertex"], THREE.ShaderChunk["shadowmap_vertex"], "}"].join("\n");

  SceneVectorShader.prototype.fragmentShader = ["uniform float opacity;", "varying vec3 vLightFront;", "#ifdef DOUBLE_SIDED", "varying vec3 vLightBack;", "#endif", THREE.ShaderChunk["color_pars_fragment"], THREE.ShaderChunk["map_pars_fragment"], THREE.ShaderChunk["lightmap_pars_fragment"], THREE.ShaderChunk["envmap_pars_fragment"], THREE.ShaderChunk["fog_pars_fragment"], THREE.ShaderChunk["shadowmap_pars_fragment"], THREE.ShaderChunk["specularmap_pars_fragment"], "void main() {", "gl_FragColor = vec4( vec3 ( 1.0 ), opacity );", THREE.ShaderChunk["map_fragment"], THREE.ShaderChunk["alphatest_fragment"], THREE.ShaderChunk["specularmap_fragment"], "#ifdef DOUBLE_SIDED", "if ( gl_FrontFacing )", "gl_FragColor.xyz *= vLightFront;", "else", "gl_FragColor.xyz *= vLightBack;", "#else", "gl_FragColor.xyz *= vLightFront;", "#endif", THREE.ShaderChunk["lightmap_fragment"], THREE.ShaderChunk["color_fragment"], THREE.ShaderChunk["envmap_fragment"], THREE.ShaderChunk["shadowmap_fragment"], THREE.ShaderChunk["linear_to_gamma_fragment"], THREE.ShaderChunk["fog_fragment"], "}"].join("\n");

  return SceneVectorShader;

})();

var SceneHeight;

SceneHeight = (function() {
  SceneHeight.prototype._canvas = null;

  SceneHeight.prototype._ctx = null;

  SceneHeight.prototype._textDisplacement = null;

  SceneHeight.prototype._textTest = null;

  SceneHeight.prototype._textW = 0;

  SceneHeight.prototype._textH = 0;

  SceneHeight.prototype._orientation = 0.0;

  SceneHeight.prototype._renderer = null;

  SceneHeight.prototype._camera = null;

  SceneHeight.prototype._scene = null;

  SceneHeight.prototype._plane = null;

  SceneHeight.prototype._uniforms = null;

  SceneHeight.prototype._texture = null;

  SceneHeight.prototype._size = 512;

  function SceneHeight() {
    this._canvas = document.getElementById("wind_height_map");
    this._ctx = this._canvas.getContext("2d");
    this._textDisplacement = document.getElementById("texture--displacement");
    this._textTest = document.getElementById("texture--test");
    this._textW = this._textDisplacement.width;
    this._textH = this._textDisplacement.height;
    this._ctx.fillStyle = "rgba( 0, 0, 0, 1 )";
    this._ctx.fillRect(0, 0, this._size, this._size);
    this._initScene3D();
  }

  SceneHeight.prototype._initScene3D = function() {
    var ambient, container, geom, mat, point;
    this._renderer = new THREE.WebGLRenderer({
      alpha: false
    });
    this._renderer.setClearColor(0x444444);
    this._renderer.setSize(512, 512);
    container = document.getElementById("wind_height_map_3d");
    container.appendChild(this._renderer.domElement);
    this._camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
    this._camera.position.set(0, 0, 0);
    this._scene = new THREE.Scene();
    ambient = new THREE.AmbientLight(0x444444);
    this._scene.add(ambient);
    point = new THREE.PointLight(0x0000ff, 1, 2000);
    point.position.x = 100;
    point.position.y = 0;
    point.position.z = -1000;
    this._scene.add(point);
    geom = new THREE.PlaneGeometry(512, 512, 50, 50);
    mat = this._getMaterial();
    this._plane = new THREE.Mesh(geom, mat);
    this._plane.position.z = -1000;
    this._plane.rotation.y = 1;
    this._plane.receiveShadows = true;
    return this._scene.add(this._plane);
  };

  SceneHeight.prototype._getMaterial = function() {
    var params, shader;
    shader = new SceneHeightShader();
    this._uniforms = shader.uniforms;
    params = {
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: this._uniforms,
      lights: true,
      color: 0xff00ff,
      wireframe: true,
      shading: THREE.FlatShading
    };
    this._texture = new THREE.Texture(this._canvas);
    this._uniforms.uText.value = this._texture;
    return new THREE.ShaderMaterial(params);
  };

  SceneHeight.prototype.update = function() {
    var dx, dy, length, lmx, lmy, mx, my;
    lmx = stage.lastMouse.x - 512;
    lmy = stage.lastMouse.y;
    mx = stage.mouse.x - 512;
    my = stage.mouse.y;
    dx = mx - lmx;
    dy = my - lmy;
    this._orientation = Math.atan2(dy, dx);
    length = Math.sqrt(dx * dx + dy * dy);
    this._ctx.drawImage(this._canvas, 0, 0);
    this._ctx.fillStyle = "rgba( 0, 0, 0, .035 )";
    this._ctx.fillRect(0, 0, this._size, this._size);
    this._ctx.save();
    this._ctx.translate(mx, my);
    this._ctx.rotate(this._orientation);
    this._ctx.drawImage(this._textDisplacement, -this._textW >> 1, -this._textH >> 1);
    this._ctx.restore();
    this._texture.needsUpdate = true;
    return this._renderer.render(this._scene, this._camera);
  };

  return SceneHeight;

})();

var SceneHeightShader;

SceneHeightShader = (function() {
  function SceneHeightShader() {}

  SceneHeightShader.prototype.uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["common"], THREE.UniformsLib["fog"], THREE.UniformsLib["lights"], THREE.UniformsLib["shadowmap"], {
      "uText": {
        type: "t",
        value: null
      },
      "ambient": {
        type: "c",
        value: new THREE.Color(0xffffff)
      },
      "emissive": {
        type: "c",
        value: new THREE.Color(0x000000)
      },
      "wrapRGB": {
        type: "v3",
        value: new THREE.Vector3(1, 1, 1)
      }
    }
  ]);

  SceneHeightShader.prototype.vertexShader = ["#define LAMBERT", "varying vec3 vLightFront;", "varying vec2 vUv;", "uniform sampler2D uText;", "#ifdef DOUBLE_SIDED", "varying vec3 vLightBack;", "#endif", THREE.ShaderChunk["map_pars_vertex"], THREE.ShaderChunk["lightmap_pars_vertex"], THREE.ShaderChunk["envmap_pars_vertex"], THREE.ShaderChunk["lights_lambert_pars_vertex"], THREE.ShaderChunk["color_pars_vertex"], THREE.ShaderChunk["morphtarget_pars_vertex"], THREE.ShaderChunk["skinning_pars_vertex"], THREE.ShaderChunk["shadowmap_pars_vertex"], "void main() {", THREE.ShaderChunk["map_vertex"], THREE.ShaderChunk["lightmap_vertex"], THREE.ShaderChunk["color_vertex"], THREE.ShaderChunk["morphnormal_vertex"], THREE.ShaderChunk["skinbase_vertex"], THREE.ShaderChunk["skinnormal_vertex"], THREE.ShaderChunk["defaultnormal_vertex"], THREE.ShaderChunk["morphtarget_vertex"], THREE.ShaderChunk["skinning_vertex"], "vec4 mvPosition;", "#ifdef USE_SKINNING", "mvPosition = modelViewMatrix * skinned;", "#endif", "#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )", "mvPosition = modelViewMatrix * vec4( morphed, 1.0 );", "#endif", "#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )", "vec4 data = texture2D( uText, uv );", "vec4 pos = vec4( position, 1.0 );", "pos.z -= data.z * 60.0;", "mvPosition = modelViewMatrix * pos;", "#endif", "gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk["worldpos_vertex"], THREE.ShaderChunk["envmap_vertex"], THREE.ShaderChunk["lights_lambert_vertex"], THREE.ShaderChunk["shadowmap_vertex"], "}"].join("\n");

  SceneHeightShader.prototype.fragmentShader = ["uniform float opacity;", "varying vec3 vLightFront;", "varying vec2 vUv;", "uniform sampler2D uText;", "#ifdef DOUBLE_SIDED", "varying vec3 vLightBack;", "#endif", THREE.ShaderChunk["color_pars_fragment"], THREE.ShaderChunk["map_pars_fragment"], THREE.ShaderChunk["lightmap_pars_fragment"], THREE.ShaderChunk["envmap_pars_fragment"], THREE.ShaderChunk["fog_pars_fragment"], THREE.ShaderChunk["shadowmap_pars_fragment"], THREE.ShaderChunk["specularmap_pars_fragment"], "void main() {", "gl_FragColor = vec4( vec3 ( 1.0 ), opacity );", THREE.ShaderChunk["map_fragment"], THREE.ShaderChunk["alphatest_fragment"], THREE.ShaderChunk["specularmap_fragment"], "#ifdef DOUBLE_SIDED", "if ( gl_FrontFacing )", "gl_FragColor.xyz *= vLightFront;", "else", "gl_FragColor.xyz *= vLightBack;", "#else", "gl_FragColor.xyz *= vLightFront;", "#endif", THREE.ShaderChunk["lightmap_fragment"], THREE.ShaderChunk["color_fragment"], THREE.ShaderChunk["envmap_fragment"], THREE.ShaderChunk["shadowmap_fragment"], THREE.ShaderChunk["linear_to_gamma_fragment"], THREE.ShaderChunk["fog_fragment"], "}"].join("\n");

  return SceneHeightShader;

})();

var StageSingleton, stage,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

StageSingleton = (function() {
  var StageInstance, instance;

  function StageSingleton() {}

  StageInstance = (function() {
    StageInstance.prototype.lastMouse = null;

    StageInstance.prototype.mouse = null;

    StageInstance.prototype.size = null;

    StageInstance.prototype._$window = null;

    function StageInstance() {
      this._onResize = __bind(this._onResize, this);
      this._onMouseMove = __bind(this._onMouseMove, this);
      this.lastMouse = {
        x: 0.0,
        y: 0.0
      };
      this.mouse = {
        x: 0.0,
        y: 0.0
      };
      this.size = {
        w: 0,
        h: 0
      };
      this._$window = $(window);
      $(document).on("mousemove", this._onMouseMove);
      this._$window.on("resize", this._onResize);
      this._onResize();
    }

    StageInstance.prototype._onMouseMove = function(e) {
      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;
      this.mouse.x = e.clientX;
      return this.mouse.y = e.clientY;
    };

    StageInstance.prototype._onResize = function(e) {
      this.size.w = this._$window.width();
      return this.size.h = this._$window.height();
    };

    return StageInstance;

  })();

  instance = null;

  StageSingleton.get = function() {
    return instance != null ? instance : instance = new StageInstance();
  };

  return StageSingleton;

}).call(this);

stage = StageSingleton.get();

var Main,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Main = (function() {
  Main.prototype._sceneHeight = null;

  Main.prototype._sceneVector = null;

  Main.prototype._stats = null;

  function Main() {
    this._update = __bind(this._update, this);
    this._sceneHeight = new SceneHeight();
    this._sceneVector = new SceneVector();
    this._stats = new Stats();
    this._stats.domElement.style.position = "absolute";
    this._stats.domElement.style.right = "0";
    this._stats.domElement.style.top = "0";
    this._stats.domElement.style.zIndex = 100;
    document.body.appendChild(this._stats.domElement);
    this._update();
  }

  Main.prototype._update = function() {
    this._sceneVector.update();
    this._sceneHeight.update();
    this._stats.update();
    return requestAnimationFrame(this._update);
  };

  return Main;

})();

new Main();
