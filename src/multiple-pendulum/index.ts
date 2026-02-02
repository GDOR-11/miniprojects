document.getElementById("configuration-form").addEventListener("submit", async () => {
    const N = (document.getElementById("num-pendulums-input") as HTMLInputElement).value || "NaN";
    const dt = (document.getElementById("time-step-input") as HTMLInputElement).value || "NaN";
    const substeps = (document.getElementById("substeps-input") as HTMLInputElement).value || "NaN";
    const g = (document.getElementById("gravity-input") as HTMLInputElement).value || "NaN";
    window.localStorage.setItem("N", N);
    window.localStorage.setItem("dt", dt);
    window.localStorage.setItem("substeps", substeps);
    window.localStorage.setItem("g", g);
});
