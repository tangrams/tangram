if (position.z > 0.) {
    position.z *= max((sin(position.z + u_time) + 1.0) / 2.0, 0.05); // elevator buildings
}
