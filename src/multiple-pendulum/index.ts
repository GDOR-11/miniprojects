document.getElementById("configuration-form").addEventListener("submit", async () => {
    const N = (document.getElementById("num-pendulums-input") as HTMLInputElement).value || "NaN";
    const dt = (document.getElementById("time-step-input") as HTMLInputElement).value || "NaN";
    const tpf = (document.getElementById("tpf-input") as HTMLInputElement).value || "NaN";
    const g = (document.getElementById("gravity-input") as HTMLInputElement).value || "NaN";
    window.localStorage.setItem("N", N);
    window.localStorage.setItem("dt", dt);
    window.localStorage.setItem("tpf", tpf);
    window.localStorage.setItem("g", g);
});
