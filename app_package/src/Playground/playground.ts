import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

class Playground {

    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        function createPyramid(width: number, height: number) {
            var pyramid = new BABYLON.Mesh("pyramid", scene);

            var indices = [0, 1, 2, 3, 4];
            var positions = [0,0,0, width,0,0, 0,width,0, width,width,0, width/2,width/2,height];

            var vertexData = new BABYLON.VertexData();
            vertexData.positions = positions;
            vertexData.indices = indices;

            vertexData.applyToMesh(pyramid);

            return pyramid;
        }

        // Scene, Camera and Light setup
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        // --------------- LOADING OF TEXTURES -----------------------
        // From babylon Texture Library https://doc.babylonjs.com/toolsAndResources/assetLibraries/availableTextures
        const texture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/Logo.png", scene);

        // 'ground' mesh for reference.
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
        ground.material = new BABYLON.StandardMaterial("ground material", scene);
        // use emissive color property to exclude lighting (usually would be diffuseColor)
        // @ts-ignore
        ground.material.emissiveColor = BABYLON.Color3.Gray();

        // box mesh for use with our shader
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 });
        box.position.y = 1;
        box.position.x = 1.5;

        // box mesh to see how BabylonJS renders ligh
        const controlbox = BABYLON.MeshBuilder.CreateBox("control box", { size: 2 });
        controlbox.position.y = 1;
        controlbox.position.x = -1.5;
        controlbox.material = new BABYLON.StandardMaterial("control material", scene);
        //@ts-ignore
        controlbox.material.disableLighting = true;

        // use emissive texture property to exclude lighting (usually would be diffuseTexture)
        //@ts-ignore
        controlbox.material.emissiveTexture = texture;

        // ` ` these quatioan marks allow a multi-line string in Javascript (" " or ' ' is single line)
        var vertex_shader = `
        attribute vec3 position;
        attribute vec2 uv;

        varying vec2 vUV;

        uniform mat4 world;
        uniform mat4 view;
        uniform mat4 projection;
        uniform mat3 inverseTranspose;

        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = world * localPosition;     
            vec4 viewPosition  = view * worldPosition;
            vec4 clipPosition  = projection * viewPosition;

            gl_Position = clipPosition;

            vUV = uv;
        }
    `;

        var fragment_shader = `

        varying vec2 vUV;
        uniform sampler2D mainTexture;

        void main() {
             // implement basic texturing
             
            vec4 color = texture(mainTexture, vUV);
            gl_FragColor = color;
        }
    `;

        var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
            // assign source code for vertex and fragment shader (string)
            vertexSource: vertex_shader,
            fragmentSource: fragment_shader
        },
            {
                // assign shader inputs
                attributes: ["position", "uv"], // position and uv are BabylonJS build-in
                uniforms: ["world", "view", "projection",
                    "inverseTranspose"
                ], // world, view, projection are BabylonJS build-in
                samplers: ["mainTexture"]
            });
        shaderMaterial.setTexture("mainTexture", texture);
        box.material = shaderMaterial;

        var pyramid = createPyramid(5,5);
        pyramid.position.y = 5;

        return scene;
    }
}

export function CreatePlaygroundScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
    return Playground.CreateScene(engine, canvas);
}
