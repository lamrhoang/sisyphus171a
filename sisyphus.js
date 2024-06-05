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

const {Cube, Axis_Arrows, Textured_Phong, Fake_Bump_Map} = defs;

class Ramp extends Shape {
  constructor() {
    super("positions", "normals", "texture_coord");

    this.arrays.position = [
      // Bottom face vertices
      Vector.of(-15, 0, 0), Vector.of(15, 0, 0), Vector.of(-15, 0, -40), Vector.of(15, 0, -40),
      // Top face vertices
      Vector.of(-15, 40, -40), Vector.of(15, 40, -40)
    ];

    this.arrays.normal = [
      Vector.of(0, -1, 0), Vector.of(0, -1, 0), Vector.of(0, -1, 0), Vector.of(0, -1, 0),
      Vector.of(0, 1, 0), Vector.of(0, 1, 0)
    ];

    this.indices = [
      0, 1, 2, 1, 3, 2,
      2, 3, 4, 3, 5, 4,  // Back face
      0, 2, 4, 0, 4, 1,  // Left face
      1, 5, 3, 1, 4, 5   // Right face
    ];

    const length = 40;
    const height = 35;

    this.arrays.texture_coord = [
        // Bottom face texture coordinates
        vec(0, 0), vec(1, 0), vec(0, length / (length + height)), vec(1, length / (length + height)),
        // Top face texture coordinates
        vec(0, length / (length + height) + height / (length + height)), vec(1, length / (length + height) + height / (length + height))
    ];
  }
}


const Person = (defs.Person = class Person extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");

        this.shapes = {
            torso: new defs.Cube(),
            head: new defs.Cube(),

            arm: new defs.Cube(),
            leg: new defs.Cube(),
            ball: new defs.Subdivision_Sphere(3),
        };

        this.materials = {
            head: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#fdf5e2"),
            }),
            torso: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#654321"),
            }),
            arm: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#fdf5e2"),
            }),
            leg: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#fdf5e2"),
            }),
             ball: new Material(new defs.Fake_Bump_Map(), {
                ambient: 0.2,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#A9A9A9"),
                texture: new Texture("assets/ramp_final.png", "LINEAR_MIPMAP_LINEAR"),
                texture_offset: 0,
            }),
        };
    }

    draw(context, program_state, model_transform, material) {
        // Draw the torso
        const t = program_state.animation_time / 1000;

        let ball_speed =
            Math.PI / 2 + (Math.PI / 2) * Math.sin((1 / 4) * Math.PI * t);

        let torso_transform = model_transform.times(Mat4.scale(1, 2, 0.5));
        this.shapes.torso.draw(
            context,
            program_state,
            torso_transform,
            this.materials.torso
        );

        // Draw the ball
        let ball_transform = model_transform
            .times(Mat4.translation(0, 6, -1.5))
            .times(Mat4.rotation(-1 * ball_speed, 1, 0, 0))
            .times(Mat4.scale(3, 3, 3));
        this.shapes.ball.draw(
            context,
            program_state,
            ball_transform,
            this.materials.ball
        );

        // Draw the head
        let head_transform = model_transform
            .times(Mat4.translation(0, 3, 0))
            .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.head.draw(
            context,
            program_state,
            head_transform,
            this.materials.head
        );

        // Draw the left arm
        let left_arm_transform = model_transform
            .times(Mat4.translation(-2, 3, 0))
            .times(Mat4.rotation(Math.PI / 5, 0, 0, 1))
            .times(Mat4.scale(0.5, 2, 0.5));
        this.shapes.arm.draw(
            context,
            program_state,
            left_arm_transform,
            this.materials.arm
        );

        // Draw the right arm
        let right_arm_transform = model_transform
            .times(Mat4.translation(2, 3, 0))
            .times(Mat4.rotation((-1 * Math.PI) / 5, 0, 0, 1))
            .times(Mat4.scale(0.5, 2, 0.5));
        this.shapes.arm.draw(
            context,
            program_state,
            right_arm_transform,
            this.materials.arm
        );

        let walking = (Math.PI / 5) * Math.sin(2 * Math.PI * t);
        // Draw the left leg
        let left_leg_transform = model_transform
            .times(Mat4.translation(-0.5, -3, 0))
            .times(Mat4.rotation(walking, 1, 0, 0))
            .times(Mat4.scale(0.5, 1, 0.5));
        this.shapes.leg.draw(
            context,
            program_state,
            left_leg_transform,
            this.materials.leg
        );

        // Draw the right leg
        let right_leg_transform = model_transform
            .times(Mat4.translation(0.5, -3, 0))
            .times(Mat4.rotation(-1 * walking, 1, 0, 0))
            .times(Mat4.scale(0.5, 1, 0.5));
        this.shapes.leg.draw(
            context,
            program_state,
            right_leg_transform,
            this.materials.leg
        );
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
            // mountain: new Pyramid(false),
            sisyphus: new Person(),
            ramp: new Ramp(),
        };

        // *** Materials
        this.materials = {
            human: new Material(new defs.Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#FFFFFF"),
            }),
            ball: new Material(new defs.Fake_Bump_Map(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#654321"),
                texture: new Texture("assets/ramp_final.png", "LINEAR_MIPMAP_LINEAR"),
                texture_offset: 0,
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
                color: hex_color("#394854"),
            }),
            
            ramp: new Material(new defs.Fake_Bump_Map(), {
                color: hex_color("#A9A9A9"),
                ambient: 0.3, diffusivity: 0.8, specularity: 1,
                texture: new Texture("assets/ramp_2.png", "LINEAR_MIPMAP_LINEAR"),
                texture_offset: 0,
            }),
        };

        this.sisyphus_transform = Mat4.identity()
            .times(Mat4.translation(0, -33, -5))
            .times(Mat4.scale(1.3,1.3,1.3));
        this.top = false;
        this.initial_camera_location = Mat4.look_at(
            vec3(0, 10, 4 * 25),
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );
        const base_vector = Vector.of(-15, 0, 0).minus(Vector.of(-15, 0, -40));
        const side_vector = Vector.of(-15, 0, 0).minus(Vector.of(-15, 40, -40));
        const dot_product = base_vector.dot(side_vector);
        const base_mag = base_vector.norm();
        const side_mag = side_vector.norm();
        const cosine_angle = dot_product / (base_mag * side_mag);
        this.ramp_angle = Math.acos(cosine_angle);
        this.character_y_position = this.sisyphus_transform[1][3];
    }

    rotate_left() {
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.rotation(0.5, 0, 1, 0)
        );
    }

    rotate_right() {
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.rotation(-0.5, 0, 1, 0)
        );
    }

    move_left() {
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(-2, 0, 0)
        );
    }

    move_right() {
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(2, 0, 0)
        );
    }

    move_up() {
        let move_y = 2;
        let move_z = -move_y / Math.tan(this.ramp_angle);

        if (this.sisyphus_transform[1][3] > 50) {
            this.top = true;
            this.character_y_position = (this.character_y_position + move_y) % 60;
            return;
        }

        this.character_y_position = this.character_y_position + move_y;
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(0, move_y, move_z)
        );
    }

    move_down() {
        let move_y = -2;
        let move_z = -move_y / Math.tan(this.ramp_angle);

        if (this.sisyphus_transform[1][3] < -30) {
            this.character_y_position = (this.character_y_position + move_y) % 60;
            return;
        }

        this.character_y_position  = this.character_y_position + move_y;
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(0, move_y, move_z)
        );
    }

    make_control_panel() {
        this.key_triggered_button(
            "Initial Camera View",
            ["Control", "0"],
            () => (this.attached = () => this.initial_camera_location)
        );

        this.key_triggered_button(
            "Attach to sisyphus",
            ["Control", "1"],
            () => (this.attached = () => this.sisyphus_transform)
        );

        this.key_triggered_button("Left", ["ArrowLeft"], () =>
            this.move_left()
        );

        this.key_triggered_button("Right", ["ArrowRight"], () =>
            this.move_right()
        );

        this.key_triggered_button("Rotate Left", ["q"], () =>
            this.rotate_left()
        );

        this.key_triggered_button("Rotate Right", ["e"], () =>
            this.rotate_right()
        );

        this.key_triggered_button("Move Up", ["ArrowUp"], () =>
            this.move_up()
        );

        this.key_triggered_button("Move Down", ["ArrowDown"], () =>
            this.move_down()
        );
    }

    interpolateColor(color1, color2, scale) {
        return vec4(
            color1[0] * (1 - scale) + color2[0] * scale,
            color1[1] * (1 - scale) + color2[1] * scale,
            color1[2] * (1 - scale) + color2[2] * scale,
            color1[3] * (1 - scale) + color2[3] * scale
        );
    }

    display(context, program_state) {
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

        // sun
        const arc_radius = 50;
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

        color_scale = Math.max(0, Math.min(1, color_scale));
        let sky_blue = vec4(0.53, 0.81, 0.92, 1);
        let black = vec4(0, 0, 0, 1);
        let background_color = this.interpolateColor(
            black,
            sky_blue,
            color_scale
        );

        // background;
        context.context.clearColor(
            background_color[0],
            background_color[1],
            background_color[2],
            background_color[3]
        );
        context.context.clear(
            context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT
        );

        sun_transform = sun_transform
            .times(Mat4.translation(sun_x, sun_y, sun_z))
            .times(Mat4.scale(5, 5, 5));
        this.shapes.sun.draw(
            context,
            program_state,
            sun_transform,
            this.materials.sun.override({ color: sun_color })
        );

        const light_position = vec4(sun_x, sun_y, sun_z, 1);
        program_state.lights = [new Light(light_position, sun_color, 1000)];

    
        // previous code for sisyphus going up mountain

        let model_transform = Mat4.identity();

        // ramp drawing
        let ramp_scale = 4;
        let ramp_transform = model_transform
            .times(Mat4.translation(0,-43,0))
            .times(Mat4.scale(ramp_scale,ramp_scale,ramp_scale));
        const max_height = 30; 
        const min_height = -30;
        const texture_offset = (this.character_y_position - min_height) / (max_height - min_height);
        this.shapes.ramp.draw(context, program_state, ramp_transform, this.materials.ramp.override({texture_offset:texture_offset}));

        this.shapes.sisyphus.draw(
            context,
            program_state,
            this.sisyphus_transform,
            this.materials.human
        );

        this.sisyphus = this.sisyphus_transform;

    
        const camera_offset = Mat4.translation(0, 10, 40);
        if (this.attached !== undefined && this.attached() === this.sisyphus_transform) {
            const desired_camera_transform = this.sisyphus_transform.times(camera_offset).times(Mat4.inverse(Mat4.translation(0, 0, 0)));
            program_state.set_camera(Mat4.inverse(desired_camera_transform));
        } else if (this.attached !== undefined && this.attached() === this.initial_camera_location) {
            let desired = this.attached();
            program_state.camera_inverse = desired;
        }
    }
}
