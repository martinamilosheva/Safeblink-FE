import {
  setAuthenticatedUser,
  isUserAuthenticated,
  SESSION_KEYS,
} from "./sessionHelper.js";

import { populateUserDetailFieldsAndSetBehavior } from "./pageProfile/index.js";
import {
  renderCards,
  setFiltersFunctionality,
} from "./pageInformation/index.js";
import { renderDiscussionsAndDefineBehavior } from "./pageDiscussions/index.js";

// Optional: expose USER_INFO_MAP from sessionHelper if not already
import { getUserInfoMap } from "./sessionHelper.js";

const SUPPORTED_ROUTES_MAP = {
  safeblink: "safeblink",
  information: "information",
  profile: "profile",
  discussion: "discussion",
  contact: "contact",
  login: "login",
  notFound: "not-found",
};

const isRouteSupported = (route) => Boolean(SUPPORTED_ROUTES_MAP[route]);

const getHashRoute = () => location.hash.slice(1);

const hideAllSections = () => {
  document.querySelectorAll("section").forEach((section) => {
    section.style.display = "none";
  });
};

const handleHashRouteChange = () => {
  const hashRoute = getHashRoute();
  const allSections = document.querySelectorAll("section");
  allSections.forEach((section) => (section.style.display = "none"));

  const matchedRoute = isRouteSupported(hashRoute) ? hashRoute : "not-found";
  const activeSection = document.getElementById(`${matchedRoute}`);
  if (activeSection) {
    activeSection.style.display = "block";
    activeSection.classList.add("fade-in");
  }

  switch (matchedRoute) {
    case SUPPORTED_ROUTES_MAP.information:
      renderCards();
      break;
    case SUPPORTED_ROUTES_MAP.profile:
      populateUserDetailFieldsAndSetBehavior();
      break;
    case SUPPORTED_ROUTES_MAP.discussion:
      renderDiscussionsAndDefineBehavior();
      break;
    default:
      break;
  }

  window.scrollTo(0, 0);
};

const updateUserIcon = () => {
  const userIcon = document.getElementById("user-icon");
  const loginButton = document.getElementById("login-button");
  const userDataRaw = localStorage.getItem(SESSION_KEYS.AUTHENTICATED_USER);
  if (!userDataRaw) return;

  const userData = JSON.parse(userDataRaw);
  if (userIcon) {
    userIcon.className = "";
    userIcon.style.width = "40px";
    userIcon.style.height = "40px";
    userIcon.style.borderRadius = "50%";
    userIcon.style.backgroundSize = "cover";
    userIcon.style.backgroundPosition = "center";
    userIcon.style.backgroundImage = `url(${userData.image})`;
    loginButton.style.border = "none";

    userIcon.addEventListener("click", () => {
      location.hash = `#${SUPPORTED_ROUTES_MAP.profile}`;
    });
  }
};

const resetUserIcon = () => {
  const userIcon = document.getElementById("user-icon");
  if (userIcon) {
    userIcon.className = "fa fa-user";
    userIcon.style.backgroundImage = "none";
    userIcon.style.width = "";
    userIcon.style.height = "";
    userIcon.style.borderRadius = "";
  }
};

const handleAuthenticatedUserContent = () => {
  const userAuthenticated = isUserAuthenticated();

  document.getElementById("login-link").style.display = userAuthenticated
    ? "none"
    : "block";
  document.getElementById("profile-link").style.display = userAuthenticated
    ? "block"
    : "none";
  document.getElementById("logout-button").style.display = userAuthenticated
    ? "block"
    : "none";

  if (userAuthenticated) {
    updateUserIcon();
  } else {
    resetUserIcon();
  }
};

window.addEventListener("hashchange", () => {
  hideAllSections();
  handleHashRouteChange();
  handleAuthenticatedUserContent();
});

window.addEventListener("load", () => {
  hideAllSections();
  handleAuthenticatedUserContent();
  handleHashRouteChange();
  setFiltersFunctionality();

  document.querySelector("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.querySelector("#username").value.trim();
    const password = document.querySelector("#password").value.trim();
    const userMap = getUserInfoMap(); // Get from sessionHelper

    const user = userMap[username];

    if (user && user.password === password) {
      setAuthenticatedUser(username);
      hideAllSections();
      handleAuthenticatedUserContent();

      new bootstrap.Modal(document.getElementById("welcomeModal")).show();
      location.hash = `#${SUPPORTED_ROUTES_MAP.information}`;
    } else {
      alert("Невалидно корисничко име или лозинка.");
    }
  });

  document.querySelector("#go-to-profile").addEventListener("click", () => {
    location.hash = "#profile";
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("welcomeModal")
    );
    modal.hide();
  });

  document.querySelector("#togglePassword").addEventListener("click", () => {
    const passwordInput = document.querySelector("#password");
    const icon = document.querySelector("#togglePassword");
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });

  document.querySelector("#logout-button").addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEYS.AUTHENTICATED_USER);
    hideAllSections();
    handleAuthenticatedUserContent();
    location.hash = `#${SUPPORTED_ROUTES_MAP.safeblink}`;
  });
});

// Homepage banner video functionality
const bannerImage = document.getElementById("banner-image-container");
const videoContainer = document.getElementById("video-container");

function showVideo() {
  bannerImage.classList.add("d-none");
  videoContainer.classList.remove("d-none");
}

bannerImage.addEventListener("click", showVideo);
