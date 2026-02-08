document.getElementById("configuration-form").addEventListener("submit", event => {
    const N = (document.getElementById("num-pendulums-input") as HTMLInputElement).value || "NaN";
    const dt = (document.getElementById("time-step-input") as HTMLInputElement).value || "NaN";
    const substeps = (document.getElementById("substeps-input") as HTMLInputElement).value || "NaN";
    const g = (document.getElementById("gravity-input") as HTMLInputElement).value || "NaN";
    const const_energy = (document.getElementById("energy-input") as HTMLInputElement).checked;
    let angles = (document.getElementById("angles-input") as HTMLInputElement).value || "";
    let angular_velocities = (document.getElementById("angular-velocities-input") as HTMLInputElement).value || "";

    if ([...angles.matchAll(/,/g)].length + 1 !== Number(N) && angles.trim() !== "") {
        event.preventDefault();
        alert("please provide exactly N angles");
        return;
    }
    if ([...angular_velocities.matchAll(/,/g)].length + 1 !== Number(N) && angular_velocities.trim() !== "") {
        event.preventDefault();
        alert("please provide exactly N angular velocities");
        return;
    }

    if (angles.trim() !== "") angles = angles.split(",").map(s => Number(s.trim()) * Math.PI / 180).join(",");
    if (angular_velocities.trim() !== "") angular_velocities = angular_velocities.split(",").map(s => Number(s.trim()) * Math.PI / 180).join(",");

    window.localStorage.setItem("N", N);
    window.localStorage.setItem("dt", dt);
    window.localStorage.setItem("substeps", substeps);
    window.localStorage.setItem("g", g);
    window.localStorage.setItem("const_energy", const_energy.toString());
    window.localStorage.setItem("angles", angles);
    window.localStorage.setItem("velocities", angular_velocities);
});
