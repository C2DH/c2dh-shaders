// How to use translateX, translateY, translateZ in Three.js
// @ts-nocheck
useEffect(() => {
    if (meshRef.current) {
        meshRef.current.translateY(0); // Moves the mesh 1 unit along the Z-axis
    }
}, []);
export {};
