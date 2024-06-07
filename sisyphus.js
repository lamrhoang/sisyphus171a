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

const {
    Cube,
    Axis_Arrows,
    Textured_Phong,
    Subdivision_Sphere,
    Capped_Cylinder,
    Phong_Shader,
    Fake_Bump_Map,
} = defs;

class Ramp extends Shape {
    constructor() {
        super("positions", "normals", "texture_coord");

        this.arrays.position = [
            Vector.of(-15, 0, 0),
            Vector.of(15, 0, 0),
            Vector.of(-15, 0, -40),
            Vector.of(15, 0, -40),
            Vector.of(-15, 40, -40),
            Vector.of(15, 40, -40),
        ];

        this.arrays.normal = [
            Vector.of(0, -1, 0),
            Vector.of(0, -1, 0),
            Vector.of(0, -1, 0),
            Vector.of(0, -1, 0),
            Vector.of(0, 1, 0),
            Vector.of(0, 1, 0),
        ];

        this.indices = [
            0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 0, 2, 4, 0, 4, 1, 1, 5, 3, 1, 4,
            5,
        ];

        const length = 40;
        const height = 35;

        this.arrays.texture_coord = [
            vec(0, 0),
            vec(1, 0),
            vec(0, length / (length + height)),
            vec(1, length / (length + height)),
            vec(0, length / (length + height) + height / (length + height)),
            vec(1, length / (length + height) + height / (length + height)),
        ];
    }
}

class Person extends Shape {
    constructor() {
        super("position", "normal", "texture_coord");

        this.shapes = {
            torso: new Cube(),
            head: new Cube(),
            arm: new Cube(),
            leg: new Cube(),
        };

        this.materials = {
            head: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#fdf5e2"),
            }),
            torso: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#654321"),
            }),
            arm: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#fdf5e2"),
            }),
            leg: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#fdf5e2"),
            }),
        };
    }

    draw(context, program_state, model_transform) {
        const t = program_state.animation_time / 1000;
        let torso_transform = model_transform.times(Mat4.scale(1, 2, 0.5));
        this.shapes.torso.draw(
            context,
            program_state,
            torso_transform,
            this.materials.torso
        );

        let head_transform = model_transform
            .times(Mat4.translation(0, 3, 0))
            .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.head.draw(
            context,
            program_state,
            head_transform,
            this.materials.head
        );

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
}

export class Sisyphus extends Scene {
    constructor() {
        super();
        this.shapes = {
            human_head: new Subdivision_Sphere(4),
            human_torso: new Cube(),
            human_arm: new Capped_Cylinder(4, 12),
            human_leg: new Capped_Cylinder(4, 12),
            ball: new Subdivision_Sphere(4),
            ball_collision: new Subdivision_Sphere(4), // Collision sphere
            torso_collision: new Cube(), // Collision box
            ramp_collision: new Cube(), // Collision box for ramp
            sun: new Subdivision_Sphere(4),
            moon: new Subdivision_Sphere(4),
            sisyphus: new Person(),
            ramp: new Ramp(),
            ground: new Cube(),
            spike: new Cube(),
        };

        this.materials = {
            human: new Material(new Phong_Shader(), {
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
                texture: new Texture(
                    "assets/ramp_final.png",
                    "LINEAR_MIPMAP_LINEAR"
                ),
                texture_offset: 0,
            }),
            ball_collision: new Material(new Phong_Shader(), {
                ambient: 0.2,
                diffusivity: 0.2,
                specularity: 0.2,
                color: hex_color("#FF0000"), // Red for visualization
            }),
            torso_collision: new Material(new Phong_Shader(), {
                ambient: 0.2,
                diffusivity: 0.2,
                specularity: 0.2,
                color: hex_color("#00FF00"), // Green for visualization
            }),
            ramp_collision: new Material(new Phong_Shader(), {
                ambient: 0.2,
                diffusivity: 0.2,
                specularity: 0.2,
                color: hex_color("#0000FF"), // Blue for visualization
            }),
            collision_outline: new Material(new Phong_Shader(), {
                ambient: 0.1,
                diffusivity: 0.1,
                specularity: 0.1,
                color: color(0, 1, 0, 0.5), // Translucent green
            }),
            sun: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#FFFF00"),
            }),
            moon: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#888888"),
            }),
            mountain: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                color: hex_color("#394854"),
            }),
            ramp: new Material(new Fake_Bump_Map(), {
                color: hex_color("#A9A9A9"),
                ambient: 0.3,
                diffusivity: 0.8,
                specularity: 0.5,
                texture: new Texture(
                    "assets/ramp_final.png",
                    "LINEAR_MIPMAP_LINEAR"
                ),
            }),
            // ramp: new Material(new defs.Fake_Bump_Map(), {
            //     color: hex_color("#A9A9A9"),
            //     ambient: 0.3, diffusivity: 0.8, specularity: 1,
            //     texture: new Texture("assets/ramp_2.png", "LINEAR_MIPMAP_LINEAR"),
            //     texture_offset: 0,
            // }),
            ground: new Material(new Textured_Phong(), {
                color: hex_color("#7CFC00"),
                ambient: 0.3,
                diffusivity: 0.8,
                specularity: 0.5,
                // texture: new Texture("assets/rock.png", "NEAREST"),
            }),
            spike: new Material(new Textured_Phong(), {
                ambient: 0.5,
                diffusivity: 0.5,
                specularity: 1,
                texture: new Texture(
                    "assets/ramp_final.png",
                    "LINEAR_MIPMAP_LINEAR"
                ),
            }),
        };

        this.sisyphus_transform = Mat4.identity()
            .times(Mat4.translation(0, -33, -5))
            .times(Mat4.scale(1.3, 1.3, 1.3));
        this.ball_transform = Mat4.identity()
            .times(Mat4.translation(0, -27 + 9, -5))
            .times(Mat4.scale(9, 9, 9)); // Adjusted initial position
        this.ramp_transform = Mat4.identity()
            .times(Mat4.translation(0, -43, 0))
            .times(Mat4.scale(4, 4, 4));

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

        this.show_collision_boxes = false;

        this.ramps = [];
        this.spikes = [];
        // for first ramp, there are no spikes
        // test spike transform

        this.current_ramp = 0;

        let model_transform = Mat4.identity();
        this.ramp_scale = 4;
        this.ramp_scalex = this.ramp_scale * 2;

        let ramp_transform = Mat4.identity();
        ramp_transform = ramp_transform
            .times(Mat4.translation(0, -43, 0))
            .times(
                Mat4.scale(this.ramp_scalex, this.ramp_scale, this.ramp_scale)
            );

        let spikex = Math.floor(Math.random() * 20 - 10) + 1;
        let spike_transform = ramp_transform
            .times(
                Mat4.scale(
                    1 / this.ramp_scalex,
                    1 / this.ramp_scale,
                    1 / this.ramp_scale
                )
            )
            .times(Mat4.translation(spikex, 40, -40))
            .times(Mat4.scale(5, 10, 5));

        this.spikes.push([spike_transform]);

        this.ramps.push(ramp_transform);

        // Initializing ball physics parameters
        this.ball_velocity = vec(0, 0);
        this.ball_acceleration = vec(0, 0); // Example value for acceleration, negative for downwards
        this.ball_position = vec(0, 15); // Initial position of the ball along the ramp

        this.scores = [0, 0, 0];
        this.score = 0;
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
            Mat4.translation(-0.2, 0, 0)
        );
    }

    move_right() {
        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(0.2, 0, 0)
        );
    }

    move_up() {
        let move_y = 1;
        let move_z = -move_y / Math.tan(this.ramp_angle);

        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(0, move_y, move_z)
        );
        this.character_y_position = this.sisyphus_transform[1][3];

        this.update_ramps();
        this.current_ramp = Math.floor((this.character_y_position + 43) / 160);
    }

    update_ramps() {
        let num_ramps = Math.ceil((this.character_y_position + 43) / 160) + 2;

        if (this.ramps.length < num_ramps) {
            let last_ramp_transform = this.ramps[this.ramps.length - 1];
            last_ramp_transform = last_ramp_transform.times(
                Mat4.scale(
                    1 / this.ramp_scalex,
                    1 / this.ramp_scale,
                    1 / this.ramp_scale
                )
            );
            let ramp_transform = last_ramp_transform;
            ramp_transform = ramp_transform
                .times(
                    Mat4.translation(
                        0,
                        this.ramp_scale * 40,
                        this.ramp_scale * -40
                    )
                )
                .times(
                    Mat4.scale(
                        this.ramp_scalex,
                        this.ramp_scale,
                        this.ramp_scale
                    )
                );
            this.ramps.push(ramp_transform);
            this.update_spikes();
        }
    }

    update_spikes() {
        let ramp_transform = this.ramps[this.ramps.length - 1];
        ramp_transform = ramp_transform.times(
            Mat4.scale(
                1 / this.ramp_scalex,
                1 / this.ramp_scale,
                1 / this.ramp_scale
            )
        );

        let num_spikes = Math.floor(Math.random() * 5) + 5;
        // Math.floor(Math.random() * (this.character_y_position / 80)) + 1;
        let current_spikes = [];
        for (let i = 0; i < num_spikes; i++) {
            let random_offsetx = Math.floor(Math.random() * 240 - 120) + 1;

            let random_offsetyz = Math.floor(Math.random() * 160) + 1;

            let spike_transform = ramp_transform
                .times(
                    Mat4.translation(
                        random_offsetx,
                        random_offsetyz,
                        random_offsetyz * -1
                    )
                )
                .times(Mat4.scale(5, 10, 5));

            current_spikes.push(spike_transform);
        }
        this.spikes.push(current_spikes);
    }

    move_down() {
        let move_y = -2;
        let move_z = -move_y / Math.tan(this.ramp_angle);

        this.sisyphus_transform = this.sisyphus_transform.times(
            Mat4.translation(0, move_y, move_z)
        );
        this.character_y_position = this.sisyphus_transform[1][3];
        this.current_ramp = Math.floor((this.character_y_position + 43) / 160);
    }

    restart() {
        this.initial_camera_location = Mat4.look_at(
            vec3(0, 10, 4 * 25),
            vec3(0, 0, 0),
            vec3(0, 1, 0)
        );
        this.scores.push(this.score);
        this.scores = this.scores.sort(function (a, b) {
            return a - b;
        });
        this.scores = this.scores.reverse();

        this.score = 0;
        this.sisyphus_transform = Mat4.identity()
            .times(Mat4.translation(0, -33, -5))
            .times(Mat4.scale(1.3, 1.3, 1.3));
        this.ball_transform = Mat4.identity()
            .times(Mat4.translation(0, -27 + 9, -5))
            .times(Mat4.scale(9, 9, 9)); // Adjusted initial position
        this.ramp_transform = Mat4.identity()
            .times(Mat4.translation(0, -43, 0))
            .times(Mat4.scale(4, 4, 4));

        const base_vector = Vector.of(-15, 0, 0).minus(Vector.of(-15, 0, -40));
        const side_vector = Vector.of(-15, 0, 0).minus(Vector.of(-15, 40, -40));
        const dot_product = base_vector.dot(side_vector);
        const base_mag = base_vector.norm();
        const side_mag = side_vector.norm();
        const cosine_angle = dot_product / (base_mag * side_mag);
        this.ramp_angle = Math.acos(cosine_angle);
        this.character_y_position = this.sisyphus_transform[1][3];

        this.show_collision_boxes = false;

        this.ramps = [];
        this.spikes = [];
        // for first ramp, there are no spikes
        // test spike transform

        this.current_ramp = 0;

        let model_transform = Mat4.identity();
        this.ramp_scale = 4;
        this.ramp_scalex = this.ramp_scale * 2;

        let ramp_transform = Mat4.identity();
        ramp_transform = ramp_transform
            .times(Mat4.translation(0, -43, 0))
            .times(
                Mat4.scale(this.ramp_scalex, this.ramp_scale, this.ramp_scale)
            );

        let spike_transform = ramp_transform
            .times(
                Mat4.scale(
                    1 / this.ramp_scalex,
                    1 / this.ramp_scale,
                    1 / this.ramp_scale
                )
            )
            .times(Mat4.translation(-10, 40, -40))
            .times(Mat4.scale(5, 10, 5));

        this.spikes.push([spike_transform]);

        this.ramps.push(ramp_transform);

        // Initializing ball physics parameters
        this.ball_velocity = vec(0, 0);
        this.ball_acceleration = vec(0, 0); // Example value for acceleration, negative for downwards
        this.ball_position = vec(0, 15); // Initial position of the ball along the ramp
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

        this.key_triggered_button("Move Up", ["ArrowUp"], () => this.move_up());

        this.key_triggered_button("Move Down", ["ArrowDown"], () =>
            this.move_down()
        );

        this.key_triggered_button("Restart", ["r"], () => this.restart());

        this.key_triggered_button(
            "Toggle Collision Boxes",
            ["Control", "c"],
            () => {
                this.show_collision_boxes = !this.show_collision_boxes;
            }
        );

        this.new_line();
        this.live_string((box) => {
            box.textContent = "Your current score is " + this.score;
        });
        this.new_line();

        this.live_string((box) => {
            box.textContent = "Top 3 Highest Scores: ";
        });

        this.new_line();

        // if (this.scores.length > 0) {
        this.live_string((box) => {
            box.textContent = (1).toString() + ": " + this.scores[0];
        });
        this.new_line();
        // }

        this.live_string((box) => {
            box.textContent = (2).toString() + ": " + this.scores[1];
        });
        this.new_line();

        this.live_string((box) => {
            box.textContent = (3).toString() + ": " + this.scores[2];
        });
        this.new_line();
    }

    interpolateColor(color1, color2, scale) {
        return vec4(
            color1[0] * (1 - scale) + color2[0] * scale,
            color1[1] * (1 - scale) + color2[1] * scale,
            color1[2] * (1 - scale) + color2[2] * scale,
            color1[3] * (1 - scale) + color2[3] * scale
        );
    }

    check_collision(player_transform, ball_transform) {
        // Extract player collision box details
        const player_pos = player_transform.times(vec4(0, 0, 0, 1));
        const player_min = player_transform.times(vec4(-1.2, -2.4, -0.6, 1));
        const player_max = player_transform.times(vec4(1.2, 2.4, 0.6, 1));

        // Extract ball collision sphere details
        const ball_pos = ball_transform.times(vec4(0, 0, 0, 1));
        const ball_radius = 9;

        // Check AABB vs Sphere collision
        const dx = Math.max(
            player_min[0] - ball_pos[0],
            0,
            ball_pos[0] - player_max[0]
        );
        const dy = Math.max(
            player_min[1] - ball_pos[1],
            0,
            ball_pos[1] - player_max[1]
        );
        const dz = Math.max(
            player_min[2] - ball_pos[2],
            0,
            ball_pos[2] - player_max[2]
        );

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return distance < ball_radius;
    }

    // Method to compute the center of a transformed shape
    getTransformedCenter(matrix, localCenter = vec4(0, 0, 0, 1)) {
        return matrix.times(localCenter).to3(); // Convert to vec3 after transformation
    }

    // Method to compute the vector between the centers of a sphere and a cuboid
    vectorBetweenCenters(sphereMatrix, cuboidMatrix) {
        const sphereCenter = this.getTransformedCenter(sphereMatrix);
        const cuboidCenter = this.getTransformedCenter(cuboidMatrix);

        // Calculate the vector from the sphere's center to the cuboid's center
        return sphereCenter.minus(cuboidCenter);
    }

    draw_ground(context, program_state) {
        let ground_transform = Mat4.identity();

        ground_transform = ground_transform
            .times(Mat4.translation(0, -43, 0))
            .times(Mat4.scale(1080, 0.1, 1080));

        this.shapes.ground.draw(
            context,
            program_state,
            ground_transform,
            this.materials.ground
        );
    }

    draw_ball(context, program_state) {
        // Update ball position based on constant acceleration
        let velocity = this.ball_velocity;
        let acceleration = vec(0, -0.05); // Ensure this is negative for rolling down

        let move_y = this.ball_position[1] - 20; // Adjusting position to account for the ball's radius
        let move_z = -this.ball_position[1] / Math.tan(this.ramp_angle);
        let move_x = this.ball_position[0];

        let t = program_state.animation_time / 1000,
            dt = program_state.animation_delta_time / 1000;

        this.ball_transform = Mat4.identity()
            .times(Mat4.translation(move_x, move_y, move_z))
            .times(Mat4.scale(12, 12, 12)); // Update ball transform
        let ball_collision_transform = this.ball_transform.times(
            Mat4.scale(1.1, 1.1, 1.1)
        ); // Slightly larger

        // Check for collision
        if (
            this.check_collision(
                this.sisyphus_transform.times(Mat4.scale(1.2, 2.4, 0.6)),
                ball_collision_transform
            )
        ) {
            // console.log("Collision detected");
            // to be changed
            acceleration = vec(0, 0);
            let temp_v = this.vectorBetweenCenters(
                ball_collision_transform,
                this.sisyphus_transform.times(Mat4.scale(1.2, 2.4, 0.6))
            );
            // console.log(temp_v);
            let xv = temp_v[0];
            let tv = vec(temp_v[1], temp_v[2]);
            let parallel = vec(
                Math.sin(this.ramp_angle),
                Math.cos(this.ramp_angle)
            );
            let cv = tv.dot(parallel);
            let v = vec(xv, cv);
            velocity = v.times(0.1 / v.norm());

            // console.log(velocity);
        }

        if (
            this.check_collision(
                Mat4.translation(
                    ball_collision_transform[0][3],
                    -43,
                    ball_collision_transform[2][3]
                ),
                ball_collision_transform
            )
        ) {
            // console.log("Collision detected");
            // to be changed
            acceleration = vec(0, 0);
            let temp_v = this.vectorBetweenCenters(
                ball_collision_transform,
                Mat4.translation(
                    ball_collision_transform[0][3],
                    -43,
                    ball_collision_transform[2][3]
                )
            );
            // console.log(temp_v);
            let xv = temp_v[0];
            let tv = vec(temp_v[1], temp_v[2]);
            let parallel = vec(
                Math.sin(this.ramp_angle),
                Math.cos(this.ramp_angle)
            );
            let cv = tv.dot(parallel);
            let v = vec(xv, cv);
            velocity = v.times(0.1 / v.norm());
            // console.log(velocity);
        }

        this.ball_velocity = this.ball_velocity.plus(this.ball_acceleration);
        velocity = velocity.plus(acceleration);

        this.ball_acceleration = acceleration;
        this.ball_velocity = velocity;
        this.ball_position = this.ball_position.plus(velocity);

        for (let i = 0; i < this.spikes[this.current_ramp].length; i++) {
            let current_spike_transform = this.spikes[this.current_ramp][i];
            // console.log(current_spike_transform);
            if (
                this.check_collision(
                    current_spike_transform,
                    ball_collision_transform
                )
            ) {
                // console.log("Collision detected");
                // to be changed
                acceleration = vec(0, 0);
                let temp_v = this.vectorBetweenCenters(
                    ball_collision_transform,
                    current_spike_transform
                );
                // console.log(temp_v);
                let xv = temp_v[0];
                let tv = vec(temp_v[1], temp_v[2]);
                let parallel = vec(
                    Math.sin(this.ramp_angle),
                    Math.cos(this.ramp_angle)
                );
                let cv = tv.dot(parallel);
                let v = vec(xv, cv);
                velocity = v.times(0.1 / v.norm());
                // console.log(velocity);

                this.ball_velocity = this.ball_velocity.plus(
                    this.ball_acceleration
                );
                velocity = velocity.plus(acceleration);

                this.ball_acceleration = acceleration;
                this.ball_velocity = velocity;
                this.ball_position = this.ball_position.plus(velocity);
            }
        }

        move_x = this.ball_position[0];
        move_y = this.ball_position[1] - 20; // Adjusting position to account for the ball's radius
        move_z = -this.ball_position[1] / Math.tan(this.ramp_angle);

        this.ball_transform = Mat4.identity()
            .times(Mat4.translation(move_x, move_y, move_z))
            .times(Mat4.scale(12, 12, 12)); // Update ball transform

        if (this.ball_transform[1][3] > -31) {
            this.ball_transform = this.ball_transform.times(
                Mat4.rotation(-t, 1, 0, 0)
            );
        }

        ball_collision_transform = this.ball_transform.times(
            Mat4.scale(1.1, 1.1, 1.1)
        ); // Slightly larger

        this.shapes.ball.draw(
            context,
            program_state,
            this.ball_transform,
            this.materials.ball
        );

        this.score = Math.floor(
            Math.max(this.score, 0, this.ball_transform[1][3] + 6)
        );

        if (this.show_collision_boxes) {
            this.shapes.ball_collision.draw(
                context,
                program_state,
                ball_collision_transform,
                this.materials.collision_outline,
                "LINES"
            );
        }
    }

    draw_player(context, program_state) {
        this.shapes.sisyphus.draw(
            context,
            program_state,
            this.sisyphus_transform,
            this.materials.human
        );
        let torso_collision_transform = this.sisyphus_transform.times(
            Mat4.scale(1.2, 2.4, 0.6)
        ); // Slightly larger
        if (this.show_collision_boxes) {
            this.shapes.torso_collision.draw(
                context,
                program_state,
                torso_collision_transform,
                this.materials.collision_outline,
                "LINES"
            );
        }
    }

    draw_ramp(context, program_state) {
        for (let i = 0; i < this.ramps.length; i++) {
            let ramp_transform = this.ramps[i];
            const max_height = 30;
            const min_height = -30;
            const texture_offset =
                (this.character_y_position - min_height) /
                (max_height - min_height);
            this.shapes.ramp.draw(
                context,
                program_state,
                ramp_transform,
                this.materials.ramp.override({ texture_offset: texture_offset })
            );

            this.draw_spikes(context, program_state, i);
        }

        // if (this.show_collision_boxes) {
        //     let ramp_collision_transform = this.ramp_transform
        //         .times(Mat4.translation(0, 20, -20))
        //         .times(Mat4.scale(15, 20, 40)); // Adjust based on ramp dimensions
        //     this.shapes.ramp_collision.draw(
        //         context,
        //         program_state,
        //         ramp_collision_transform,
        //         this.materials.collision_outline,
        //         "LINES"
        //     );
        // }
    }
    draw_spikes(context, program_state, ramp_index) {
        for (let i = 0; i < this.spikes[ramp_index].length; i++) {
            let spike_transform = this.spikes[ramp_index][i];
            this.shapes.spike.draw(
                context,
                program_state,
                spike_transform,
                this.materials.spike
            );
        }
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(
                (context.scratchpad.controls = new defs.Movement_Controls())
            );
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

        const arc_radius = 250;
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

        context.context.clearColor(
            background_color[0],
            background_color[1],
            background_color[2],
            background_color[3]
        );
        context.context.clear(
            context.context.COLOR_BUFFER_BIT | context.context.DEPTH_BUFFER_BIT
        );

        sun_transform = this.sisyphus_transform
            .times(Mat4.translation(sun_x, sun_y, sun_z))
            .times(Mat4.scale(5, 5, 5));
        this.shapes.sun.draw(
            context,
            program_state,
            sun_transform,
            this.materials.sun.override({ color: sun_color })
        );

        const light_position = vec4(
            sun_transform[0][3],
            sun_transform[1][3],
            sun_transform[2][3],
            1
        );
        program_state.lights = [new Light(light_position, sun_color, 1000)];

        this.draw_ground(context, program_state);
        this.draw_ramp(context, program_state);
        this.draw_player(context, program_state);
        this.draw_ball(context, program_state);

        const camera_offset = Mat4.translation(0, 10, 80);
        if (
            this.attached !== undefined &&
            this.attached() === this.sisyphus_transform
        ) {
            const desired_camera_transform = this.sisyphus_transform
                .times(camera_offset)
                .times(Mat4.inverse(Mat4.translation(0, 0, 0)));
            program_state.set_camera(Mat4.inverse(desired_camera_transform));
        } else if (
            this.attached !== undefined &&
            this.attached() === this.initial_camera_location
        ) {
            let desired = this.attached();
            program_state.camera_inverse = desired;
        }
    }
}

class Texture_Scroll_Y extends Textured_Phong {
    fragment_glsl_code() {
        return (
            this.shared_glsl_code() +
            `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float texture_offset;

            void main() {
                vec2 scrolling_tex_coord = vec2(f_tex_coord.x, mod(f_tex_coord.y + texture_offset, 1.0));
                vec4 tex_color = texture2D(texture, scrolling_tex_coord);

                if (tex_color.w < .01) discard;

                gl_FragColor = vec4((tex_color.xyz + shape_color.xyz) * ambient, shape_color.w * tex_color.w);
                gl_FragColor.xyz += phong_model_lights(normalize(N), vertex_worldspace);
            } `
        );
    }

    update_GPU(
        context,
        gpu_addresses,
        graphics_state,
        model_transform,
        material
    ) {
        super.update_GPU(
            context,
            gpu_addresses,
            graphics_state,
            model_transform,
            material
        );
        context.uniform1f(
            gpu_addresses.texture_offset,
            material.texture_offset
        );
    }
}
