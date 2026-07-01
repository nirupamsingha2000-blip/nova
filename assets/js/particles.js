document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('nova-3d-scene');

    if (!mount || !window.THREE) {
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 8);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const pointer = new THREE.Vector2(0, 0);
    const accent = new THREE.Color(0x06b6d4);
    const violet = new THREE.Color(0x4f46e5);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x38bdf8, 28, 16);
    keyLight.position.set(2.8, 3.5, 4);
    scene.add(keyLight);

    const violetLight = new THREE.PointLight(0x4f46e5, 18, 14);
    violetLight.position.set(-3, -2, 3);
    scene.add(violetLight);

    const nucleusMaterial = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 1.25,
        metalness: 0.35,
        roughness: 0.18
    });

    const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 48, 48),
        nucleusMaterial
    );
    root.add(nucleus);

    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 48, 48),
        new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.12
        })
    );
    root.add(glow);

    const electronMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x67e8f9,
        emissiveIntensity: 1.7,
        roughness: 0.25
    });

    const ringMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.34
    });

    const createOrbit = (tiltX, tiltY, speed, offset) => {
        const group = new THREE.Group();
        group.rotation.x = tiltX;
        group.rotation.y = tiltY;

        const points = [];
        const radius = 2.25;
        for (let i = 0; i <= 160; i += 1) {
            const angle = (i / 160) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
        }

        const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), ringMaterial);
        const electron = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), electronMaterial);
        electron.userData = { radius, speed, offset };

        group.add(ring);
        group.add(electron);
        root.add(group);

        return { group, electron };
    };

    const orbits = [
        createOrbit(1.15, 0.25, 1.15, 0),
        createOrbit(-0.65, 1.08, 0.92, 1.9),
        createOrbit(0.35, -1.24, 1.35, 3.4)
    ];

    const moleculeMaterial = new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        emissive: 0x312e81,
        emissiveIntensity: 0.7,
        roughness: 0.3
    });

    const moleculeLineMaterial = new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.24
    });

    const molecule = new THREE.Group();
    const moleculePoints = [
        new THREE.Vector3(-2.9, -1.6, -0.8),
        new THREE.Vector3(-2.15, -2.2, 0.15),
        new THREE.Vector3(-1.35, -1.35, -0.25),
        new THREE.Vector3(2.35, 1.8, -0.5),
        new THREE.Vector3(3.05, 1.2, 0.35),
        new THREE.Vector3(1.65, 1.05, 0.15)
    ];

    moleculePoints.forEach((point, index) => {
        const node = new THREE.Mesh(
            new THREE.SphereGeometry(index % 3 === 0 ? 0.2 : 0.13, 24, 24),
            moleculeMaterial
        );
        node.position.copy(point);
        molecule.add(node);
    });

    [[0, 1], [1, 2], [3, 4], [4, 5], [5, 3]].forEach(([a, b]) => {
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([moleculePoints[a], moleculePoints[b]]),
            moleculeLineMaterial
        );
        molecule.add(line);
    });

    root.add(molecule);

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < 120; i += 1) {
        starPositions.push(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4 - 1
        );
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            color: 0x93c5fd,
            size: 0.025,
            transparent: true,
            opacity: 0.8
        })
    );
    scene.add(stars);

    const resize = () => {
        const { width, height } = mount.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    };

    const onPointerMove = (event) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    mount.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();

    const animate = () => {
        const time = clock.getElapsedTime();

        root.rotation.y += ((pointer.x * 0.32) - root.rotation.y) * 0.035;
        root.rotation.x += ((-pointer.y * 0.22) - root.rotation.x) * 0.035;
        nucleus.rotation.y = time * 0.55;
        glow.scale.setScalar(1 + Math.sin(time * 2) * 0.045);
        molecule.rotation.y = time * 0.18;
        molecule.position.y = Math.sin(time * 1.2) * 0.08;
        stars.rotation.z = time * 0.025;

        orbits.forEach(({ group, electron }, index) => {
            group.rotation.z += 0.0025 + index * 0.0008;
            const { radius, speed, offset } = electron.userData;
            const angle = time * speed + offset;
            electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();
});
