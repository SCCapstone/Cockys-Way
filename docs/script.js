document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector("nav ul").classList.toggle("active");
  document.querySelector(".hamburger").classList.toggle("active");
});

document.querySelectorAll("nav ul li").forEach((navLink) => {
  navLink.addEventListener("click", () => {
    document.querySelector("nav ul").classList.remove("active");
    document.querySelector(".hamburger").classList.remove("active");
  });
});

// image enlargement when clicked
document.querySelectorAll(".feature-info img").forEach((img) => {
  img.addEventListener("click", (e) => {
    e.stopPropagation();

    const overlay = document.createElement("div");
    overlay.className = "enlarged-image-overlay";
    const container = document.createElement("div");
    container.className = "enlarged-image-container";
    const enlargedImg = img.cloneNode();
    enlargedImg.style.display = "block";

    container.appendChild(enlargedImg);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });
    container.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});
