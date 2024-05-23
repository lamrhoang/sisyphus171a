import { defs, tiny } from "./examples/common.js";

const {
    Vector,
    Vector3,
    vec,
    vec3,
    vec4,
    color,
    hex_color,
    Shader,
    Matrix,
    Mat4,
    Light,
    Shape,
    Material,
    Scene,
    Texture,
} = tiny;

// class TexturedQuad extends Shape {
//     constructor() {
//         super("position", "normal", "texture_coord");
//         this.arrays.position = Vector3.cast(
//             [-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0]
//         );
//         this.arrays.normal = Vector3.cast(
//             [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]
//         );
//         this.arrays.texture_coord = Vector.cast(
//             [0, 0], [1, 0], [0, 1], [1, 1]
//         );
//         this.indices = [0, 1, 2, 1, 3, 2];
//     }
// }


const Pyramid = (defs.Pyramid = class Pyramid extends Shape {
    // **Pyramid** demonstrates flat vs smooth shading (a boolean argument selects
    // which one).  It is a 3D shape with a square base and four triangular faces.
    constructor(using_flat_shading) {
        super("position", "normal", "texture_coord");

        if (!using_flat_shading) {
            // Method 1: A pyramid with shared vertices. Compact, performs better,
            // but can't produce flat shading or discontinuous seams in textures.
            this.arrays.position = Vector.cast(
                [-1, -1, -1], // Base vertices
                [1, -1, -1],
                [1, -1, 1],
                [-1, -1, 1],
                [0, 1, 0] // Apex vertex
            );
            const normal_base = Vector.of(0, -1, 0);
            const normal_sides = [
                Vector.of(0, 1, 1).normalized(),
                Vector.of(1, 1, 0).normalized(),
                Vector.of(0, 1, -1).normalized(),
                Vector.of(-1, 1, 0).normalized(),
            ];
            this.arrays.normal = Vector.cast(
                normal_base,
                normal_base,
                normal_base,
                normal_base, // Base normals
                normal_sides[0],
                normal_sides[0],
                normal_sides[0],
                normal_sides[1],
                normal_sides[1],
                normal_sides[1],
                normal_sides[2],
                normal_sides[2],
                normal_sides[2],
                normal_sides[3],
                normal_sides[3],
                normal_sides[3]
            );
            this.arrays.texture_coord = Vector.cast(
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1], // Base texture coordinates
                [0.5, 1],
                [1, 0],
                [0, 0],
                [0.5, 1],
                [1, 0],
                [0, 0],
                [0.5, 1],
                [1, 0],
                [0, 0],
                [0.5, 1],
                [1, 0],
                [0, 0]
            );
            // Indices for base and sides
            this.indices.push(
                0,
                1,
                2,
                0,
                2,
                3, // Base
                4,
                0,
                1,
                4,
                1,
                2,
                4,
                2,
                3,
                4,
                3,
                0
            ); // Sides
        } else {
            // Method 2: A pyramid with independent triangles.
            this.arrays.position = Vector.cast(
                [-1, -1, -1],
                [1, -1, -1],
                [1, -1, 1],
                [-1, -1, 1], // Base
                [-1, -1, -1],
                [1, -1, -1],
                [0, 1, 0], // Side 1
                [1, -1, -1],
                [1, -1, 1],
                [0, 1, 0], // Side 2
                [1, -1, 1],
                [-1, -1, 1],
                [0, 1, 0], // Side 3
                [-1, -1, 1],
                [-1, -1, -1],
                [0, 1, 0] // Side 4
            );
            this.arrays.normal = Vector.cast(
                [0, -1, 0],
                [0, -1, 0],
                [0, -1, 0],
                [0, -1, 0], // Base
                [0, 1, 1].normalized(),
                [0, 1, 1].normalized(),
                [0, 1, 1].normalized(), // Side 1
                [1, 1, 0].normalized(),
                [1, 1, 0].normalized(),
                [1, 1, 0].normalized(), // Side 2
                [0, 1, -1].normalized(),
                [0, 1, -1].normalized(),
                [0, 1, -1].normalized(), // Side 3
                [-1, 1, 0].normalized(),
                [-1, 1, 0].normalized(),
                [-1, 1, 0].normalized() // Side 4
            );
            this.arrays.texture_coord = Vector.cast(
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1], // Base
                [0.5, 1],
                [1, 0],
                [0, 0], // Side 1
                [0.5, 1],
                [1, 0],
                [0, 0], // Side 2
                [0.5, 1],
                [1, 0],
                [0, 0], // Side 3
                [0.5, 1],
                [1, 0],
                [0, 0] // Side 4
            );
            // Indices for base and sides
            this.indices.push(
                0,
                1,
                2,
                0,
                2,
                3, // Base
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15
            ); // Sides
        }
    }
});

const Person = (defs.Person = class Person extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");

        // Define the body parts
        this.torso = new defs.Cube();
        this.head = new defs.Cube();

        (this.arm = new defs.Capped_Cylinder(4, 12)),
            (this.leg = new defs.Capped_Cylinder(4, 12)),
            // this.arm = new defs.Cylindrical_Tube(10, 10, [
            //     [0, 2],
            //     [0, 1],
            // ]);
            // this.leg = new defs.Cylindrical_Tube(10, 10, [
            //     [0, 2],
            //     [0, 1],
            // ]);
            (this.ball = new defs.Subdivision_Sphere(2));
    }

    draw(context, program_state, model_transform, material) {
        // Draw the torso
        const t = program_state.animation_time / 1000;

        let ball_speed =
            Math.PI / 2 + (Math.PI / 2) * Math.sin((1 / 4) * Math.PI * t);

        let torso_transform = model_transform.times(Mat4.scale(1, 2, 0.5));
        this.torso.draw(context, program_state, torso_transform, material);

        // Draw the ball
        let ball_transform = model_transform
            .times(Mat4.translation(0, 6, -1.5))
            .times(Mat4.rotation(-1 * ball_speed, 1, 0, 0))
            .times(Mat4.scale(3, 3, 3));
        this.ball.draw(context, program_state, ball_transform, material);

        // Draw the head
        let head_transform = model_transform
            .times(Mat4.translation(0, 3, 0))
            .times(Mat4.scale(0.5, 0.5, 0.5));
        this.head.draw(context, program_state, head_transform, material);

        // Draw the left arm
        let left_arm_transform = model_transform
            .times(Mat4.translation(-1.5, 3, 0))
            .times(Mat4.rotation(Math.PI / 5, 0, 0, 1))
            .times(Mat4.scale(0.2, 2, 0.2));
        this.arm.draw(context, program_state, left_arm_transform, material);

        // Draw the right arm
        let right_arm_transform = model_transform
            .times(Mat4.translation(1.5, 3, 0))
            .times(Mat4.rotation((-1 * Math.PI) / 5, 0, 0, 1))
            .times(Mat4.scale(0.2, 2, 0.2));
        this.arm.draw(context, program_state, right_arm_transform, material);

        // Draw the left leg
        let left_leg_transform = model_transform
            .times(Mat4.translation(-0.5, -2.5, 0))
            .times(Mat4.scale(0.2, 1, 0.2));
        this.leg.draw(context, program_state, left_leg_transform, material);

        // Draw the right leg
        let right_leg_transform = model_transform
            .times(Mat4.translation(0.5, -2.5, 0))
            .times(Mat4.scale(0.2, 1, 0.2));
        this.leg.draw(context, program_state, right_leg_transform, material);
    }
});

export class Sisyphus extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            human_head: new defs.Subdivision_Sphere(4),
            human_torso: new defs.Cube(),
            human_arm: new defs.Capped_Cylinder(4, 12),
            human_leg: new defs.Capped_Cylinder(4, 12),
            ball: new defs.Subdivision_Sphere(4),
            sun: new defs.Subdivision_Sphere(4),
            moon: new defs.Subdivision_Sphere(4),
            mountain: new Pyramid(false),
            sisyphus: new Person(),
            // background: new TexturedQuad(),
        };

        // *** Materials
        this.materials = {
            human: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#FFFFFF"),
            }),
            ball: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#654321"),
            }),
            sun: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#FFFF00"),
            }),
            moon: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#888888"),
            }),

            mountain: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#964B00"),
            }),

            // background: new Material(new defs.Textured_Phong(1), { 
            //     ambient: 1, 
            //     diffusivity: 0, 
            //     specularity: 0, 
            //     texture: new Texture("assets/bg.jpg"), 
            // }),
        };
        this.initial_camera_location = Mat4.look_at(
            vec3(0, 10, 20),
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );
    }

    make_control_panel() {}

    display(context, program_state) {
        // background
        context.context.clearColor(1, 1, 1, 1); 
        context.context.clear(context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT);
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(
                (context.scratchpad.controls = new defs.Movement_Controls())
            );
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4,
            context.width / context.height,
            0.1,
            1000
        );

        const t = program_state.animation_time / 1000,
        dt = program_state.animation_delta_time / 1000;

        // background
        // const background_transform = Mat4.identity()
        //     .times(Mat4.scale(context.width / context.height, 1, 1));
        // this.shapes.background.draw(context, program_state, background_transform, this.materials.background);

        // sun
        const arc_radius = 10;
        const max_angle = (Math.PI * 2) / 7;
        const sway_period = 8;

        const angular_frequency = (2 * Math.PI) / sway_period;
        const sun_angle = max_angle * Math.sin(angular_frequency * t);
        const sun_x = arc_radius * Math.sin(sun_angle);
        const sun_y = arc_radius * Math.cos(sun_angle);
        const sun_z = 5;

        var color_scale = sun_x / (arc_radius * Math.sin(max_angle)) + 1;
        const sun_color = color(1, 1 - color_scale, 1 - color_scale, 1);
        let sun_transform = Mat4.identity();
        sun_transform = sun_transform.times(
            Mat4.translation(sun_x, sun_y, sun_z)
        );
        this.shapes.sun.draw(
            context,
            program_state,
            sun_transform,
            this.materials.sun.override({ color: sun_color })
        );

        const light_position = vec4(sun_x, sun_y, sun_z, 1);
        program_state.lights = [new Light(light_position, sun_color, 100)];

        // mountain and character
        let model_transform = Mat4.identity();

        let mountain_transform = model_transform;

        let mountain_scale = 10;

        mountain_transform = mountain_transform.times(
            Mat4.scale(mountain_scale, mountain_scale, mountain_scale)
        );

        this.shapes.mountain.draw(
            context,
            program_state,
            mountain_transform,
            this.materials.mountain
        );

        let sisyphus_ball_transform = model_transform;

        let sisyphus_speed =
            (mountain_scale - 1) / 2 +
            ((mountain_scale - 1) / 2) * Math.sin((1 / 4) * Math.PI * t);

        sisyphus_ball_transform = sisyphus_ball_transform
            .times(Mat4.translation(0, -1 * mountain_scale, mountain_scale + 1))
            .times(Mat4.translation(0, 2 * sisyphus_speed, -1 * sisyphus_speed))
            .times(Mat4.scale(1 / 2, 1 / 2, 1 / 2));

        this.shapes.sisyphus.draw(
            context,
            program_state,
            sisyphus_ball_transform,
            this.materials.human
        );
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return (
            ` 
        precision mediump float;
        const int N_LIGHTS = ` +
            this.num_lights +
            `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace, color;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `
        );
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return (
            this.shared_glsl_code() +
            `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 ); // position in screen space
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                color = phong_model_lights( normalize( N ), vertex_worldspace );
            } `
        );
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return (
            this.shared_glsl_code() +
            `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz = color;
            } `
        );
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1),
            camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform
            .reduce((acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r));
            }, vec4(0, 0, 0, 0))
            .to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform
            .times(gpu_state.camera_inverse)
            .times(model_transform);
        gl.uniformMatrix4fv(
            gpu.model_transform,
            false,
            Matrix.flatten_2D_to_1D(model_transform.transposed())
        );
        gl.uniformMatrix4fv(
            gpu.projection_camera_model_transform,
            false,
            Matrix.flatten_2D_to_1D(PCM.transposed())
        );

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length) return;

        const light_positions_flattened = [],
            light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(
                gpu_state.lights[Math.floor(i / 4)].position[i % 4]
            );
            light_colors_flattened.push(
                gpu_state.lights[Math.floor(i / 4)].color[i % 4]
            );
        }
        gl.uniform4fv(
            gpu.light_positions_or_vectors,
            light_positions_flattened
        );
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(
            gpu.light_attenuation_factors,
            gpu_state.lights.map((l) => l.attenuation)
        );
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {
            color: color(0, 0, 0, 1),
            ambient: 0,
            diffusivity: 1,
            specularity: 1,
            smoothness: 40,
        };
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(
        context,
        gpu_addresses,
        graphics_state,
        model_transform,
        material
    ) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [
                graphics_state.projection_transform,
                graphics_state.camera_inverse,
                model_transform,
            ],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(
            gpu_addresses.model_transform,
            false,
            Matrix.flatten_2D_to_1D(model_transform.transposed())
        );
        context.uniformMatrix4fv(
            gpu_addresses.projection_camera_model_transform,
            false,
            Matrix.flatten_2D_to_1D(PCM.transposed())
        );
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return (
            this.shared_glsl_code() +
            `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            // The vertex's final resting place (in NDCS):
            gl_Position = projection_camera_model_transform * vec4( position, 1.0); 
            center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
            point_position = model_transform * vec4(position, 1.0);
        }`
        );
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return (
            this.shared_glsl_code() +
            `
        void main(){
            float sinusoidal = sin(20.0 * distance(point_position, center));
            gl_FragColor = sinusoidal * vec4(0.4783, 0.3478, 0.1739, 1);
        }`
        );
    }
}
