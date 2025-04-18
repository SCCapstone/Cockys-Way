const featureInfo = [
  {
    title: "Smart Campus Navigation",
    description:
      "The very first screen you'll come across when opening the app is our map screen! Whether you're a first-year student or just trying to make it across campus between classes, Cocky's Way makes getting around a breeze. Our app gives you real-time walking directions tailored to USC's campus layout, including key landmarks and accessible pathways. You'll never again find yourself in that classic situation, lost in the middle of campus trying to find your way from point A to point B!",
    features: [
      "Turn-by-turn walking directions with clear visuals",
      "Seamless integration with Google Maps",
      "Includes campus landmarks and local secrets",
      "Easy favoriting of locations",
      "Accessible route history for frequented journeys",
      "Filtering of locations by type",
      "Custom location pinning",
    ],
  },
  {
    title: "Extensive Professor Directory",
    description:
      "Right beside our map comes the professor directory! Included are all current USC professors, all organized into one cohesive list! Why search through pages and pages of divided directories on the web, when you can find who you need here?",
    features: [
      "Sorted professor list by last name",
      "Responsive layout to fit any phone size",
      "Search bar for easy filtering",
      "Alternative alphabetical scroll bar for searching by last name",
    ],
  },
  {
    title: "Detailed Professor Profile",
    description:
      "Tapping on a professor from the directory will land you here! With one touch, you'll be given complete access to view any professor's information within the palm of your hands!",
    features: [
      "Image of professor so that they can be easily recognized",
      "Live office hours indicator",
      "Easy navigation to office from anywhere on campus",
      "Listed contact information",
    ],
  },
  {
    title: "Calendar View",
    description:
      "The calendar view is a great way to see all of your classes and assignments in one place. Any courses you add to your schedule will automatically appear on the calendar. If you link your Blackboard calendar to your profile, your assignments will be imported too. You’ll be able to view all your courses and due dates by simply selecting a day.",
    features: [
      "View courses that occur on the day that you select",
      "View assignments that are due on the day that you select (blackboard .ics link required)",
    ],
  },
  {
    title: "Settings Management",
    description:
      "Our extensive settings page allows you to customize your experience throughout the app. Here at Cocky's Way, we believe in personalization as well as privacy for our users. For that reason, we've made it very easy to manage all of your settings, quickly delete your stored data/account, and customize the look of the app to best suit your preferences",
    features: [
      "Change the app's theme between dark mode and light mode to suit your style",
      "Manage notification settings",
      "Quickly delete your account and all stored data (account required)",
      "View favorite locations (account required)",
      "Add your blackboard .ics link to import your Blackboard calendar that contains due dates and deadlines",
    ],
  },
  {
    title: "Personalized Class Schedule",
    description:
      "No more flipping between apps or printing out your schedule. Cocky's Way displays your daily and weekly class schedule right inside the app, and shows you exactly where to go. With seamless integration from Blackboard and local databases, you'll always be on time—and on track.",
    features: [
      "See your upcoming classes at a glance",
      "Add classes at your discretion",
      "Add your homework schedule to calendar with a link",
    ],
  },
];

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

const enlargeImage = (e) => {
  e.stopPropagation();
  const overlay = document.createElement("div");
  overlay.className = "enlarged-image-overlay";
  const container = document.createElement("div");
  container.className = "enlarged-image-container";
  const enlargedImg = e.currentTarget.cloneNode();
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
};

const showSlides = (n) => {
  let i;
  let slides = document.querySelectorAll(".slide");
  let dots = document.querySelectorAll(".demo");

  if (n > slides.length) {
    slideIndex = 1;
  }

  for (let i = 0; i < slides.length; ++i) {
    slides[i].style.display = "none";

    const slideImage = slides[i].firstChild.nextSibling;
    if (n === i) {
      slides[i].classList.add("current");

      slideImage.removeEventListener("click", enlargeImage);
      slideImage.addEventListener("click", enlargeImage);
    } else {
      slides[i].classList.remove("current");
      slideImage.removeEventListener("click", enlargeImage);
    }
  }

  for (i = 0; i < dots.length; ++i) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  const caption = document.querySelector(".feature-caption");
  caption.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = featureInfo[n].title;
  caption.appendChild(title);

  const description = document.createElement("p");
  description.textContent = featureInfo[n].description;
  caption.appendChild(description);

  const listTitle = document.createElement("p");
  listTitle.textContent = "Features include: ";
  caption.appendChild(listTitle);

  const list = document.createElement("ul");

  featureInfo[n].features.forEach((feature) => {
    const listItem = document.createElement("li");
    listItem.textContent = feature;
    list.appendChild(listItem);
  });

  caption.appendChild(list);

  slides[n].style.display = "block";
  dots[n].className += " active";
};

document.querySelectorAll(".demo.cursor").forEach((image, index) => {
  image.addEventListener("click", () => showSlides(index));
});

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  document.querySelector(".red-triangle").style.transform = `rotate(45deg) translateY(${-scrollY * 0.4}px) translateX(${-scrollY * 1.5}px)`;
  document.querySelector(".logo-parallax").style.transform = `translateY(${scrollY * 0.5}px)`;

})

showSlides(0);
