import fetch from 'node-fetch';
import { Octokit } from '@octokit/rest';
import { config as loadDotenv } from 'dotenv';
import pretty from 'pretty';
import { createPatch } from 'diff';
import moment from 'moment';
import { Webhook } from 'webhook-discord';

loadDotenv();
const octokit = new Octokit({
    auth: process.env.GITHUB_PAT,
});
if (typeof process.env.DISCORD_WEBHOOK !== 'string') {
    console.error('Invalid webhook provided.');
    process.exit(1);
}
const webhook = new Webhook(process.env.DISCORD_WEBHOOK);

const INFORMATION_CENTRE_PATH = 'https://www.mun.ca/covid19/';

const oldData = `<!DOCTYPE html>
<html lang="en-CA" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# foaf: http://xmlns.com/foaf/0.1/ dc: http://purl.org/dc/elements/1.1/" vocab="http://schema.org/">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1"><!-- Google Tag Manager -->
    <script>
      (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src =
          'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', 'GTM-TB37L6');
    </script><!-- End Google Tag Manager -->
    <meta name="copyright" content="Copyright (c) 2020 Memorial University of Newfoundland">
    <meta name="title" content="COVID-19 Information Hub | COVID-19 | Memorial University of Newfoundland">
    <meta name="keywords" content="">
    <meta name="description" content="Please monitor this website for accurate information and updates on COVID-19 and the university’s response.">
    <meta name="mun:site" content="1626">
    <meta name="mun:section" content="0">
    <meta name="mun:page" content="1">
    <meta name="generator" content="Memorial Site-Builder" />
    <meta property="og:url" content="https://www.mun.ca/covid19/" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="en_CA" />
    <meta property="og:site_name" content="Memorial University of Newfoundland" />
    <meta property="og:title" content="COVID-19" />
    <meta property="og:description" content="Please monitor this website for accurate information and updates on COVID-19 and the university’s response." />
    <meta property="og:image" content="https://www.mun.ca/marcomm/images/content/94-180726465.jpg" />
    <meta name="twitter:domain" content="www.mun.ca" />
    <meta name="twitter:title" content="COVID-19" />
    <meta name="twitter:description" content="Please monitor this website for accurate information and updates on COVID-19 and the university’s response." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://www.mun.ca/marcomm/images/content/94-180726465.jpg" />
    <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "CollegeOrUniversity",
        "name": "Memorial University of Newfoundland",
        "url": "http://www.mun.ca",
        "sameAs": [
          "http://www.facebook.com/MemorialUniversity",
          "http://twitter.com/memorialu",
          "http://instagram.com/memorialuniversity",
          "http://www.youtube.com/user/MemorialUVideos",
          "http://memorialfutureu.tumblr.com/"
        ],
        "logo": "http://www.mun.ca/appinclude/brand/gkg/mun-logo.jpg",
        "image": "https://clf.mun.ca/bedrock/public/assets/baratheon/images/MUN_Logo_RGB.png"
      }
    </script><!-- Favicon -->
    <link rel="apple-touch-icon" sizes="57x57" href="https://clf.mun.ca/favicon/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="114x114" href="https://clf.mun.ca/favicon/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="72x72" href="https://clf.mun.ca/favicon/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="144x144" href="https://clf.mun.ca/favicon/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="60x60" href="https://clf.mun.ca/favicon/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="120x120" href="https://clf.mun.ca/favicon/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="76x76" href="https://clf.mun.ca/favicon/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="152x152" href="https://clf.mun.ca/favicon/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://clf.mun.ca/favicon/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="https://clf.mun.ca/favicon/favicon-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="https://clf.mun.ca/favicon/favicon-160x160.png" sizes="160x160">
    <link rel="icon" type="image/png" href="https://clf.mun.ca/favicon/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="https://clf.mun.ca/favicon/favicon-16x16.png" sizes="16x16">
    <link rel="icon" type="image/png" href="https://clf.mun.ca/favicon/favicon-32x32.png" sizes="32x32">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="https://clf.mun.ca/favicon/mstile-144x144.png">
    <title>COVID-19 Information Hub | COVID-19 | Memorial University of Newfoundland</title>
    <link href="//clf.mun.ca/bedrock/public/assets/baratheon/css/template.min.css?1568216557" rel="stylesheet" />
    <link href="/appinclude/_environment/sites/1626/baratheon/instance.css?1584117125" rel="stylesheet" />
    <script src="//clf.mun.ca/bedrock/public/assets/baratheon/js/jquery.min.js?1568216557"></script>
    <style>
      /*Adjust styles for number of menu items*/
      @media (min-width: 992px) {
        #top-menu ul li {
          width: 25%;
        }

        #top-menu>ul li:nth-child(1n+5) {
          display: none;
        }
      }
    </style>
  </head>

  <body class="site_1626 Blue-2727 layout-covid19 section_0 page_1 clc_1 subsite-landing" vocab="http://schema.org/">
    <!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TB37L6" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->
    <meta property="url" content="https://www.mun.ca/covid19/" />
    <meta property="name" content="COVID-19 Information Hub|COVID-19" />
    <meta property="copyrightYear" content="2020" />
    <meta property="copyrightHolder" content="Memorial University of Newfoundland" />
    <meta property="description" content="Please monitor this website for accurate information and updates on COVID-19 and the university’s response." />
    <meta property="datePublished" content="2020-03-14T14:23:01-02:30" />
    <meta property="dateModified" content="2020-03-14T14:23:01-02:30" />
    <meta property="author" content="Memorial University of Newfoundland" />
    <header typeof="WPHeader">
      <meta property="name" content="Page Header" />
      <meta property="description" content="Search, Apply, Login and Navigate our Sites." />
      <!--SEARCH AREA -->
      <div id="masthead-curtain" class="collapsed">
        <div class="container-fluid" id="masthead-curtain-close-wrapper">
          <div class="row">
            <div class="col-xs-12"><button class="pull-right masthead-curtain-close" id="masthead-curtain-close" aria-label="Close" title="Close"><span class="icon-close" aria-hidden="true" style=""></span></button></div>
          </div>
        </div>
        <div id="masthead-curtain-content">
          <div id="search" class="hidden masthead-subject">
            <div class="container">
              <div class="row">
                <div class="masthead-item">
                  <form method="get" action="//www.mun.ca/main/search.php" id="mcs-search-form">
                    <div class="col-sm-12 col-md-offset-2 col-md-7">
                      <div class="search-container"><label for="mcs-search-field" style="display: none;">Search:</label><input id="mcs-search-field" placeholder="Search for..." type="text" class="typeahead" name="q" autocomplete="off" /><input type="hidden" name="from" value="" id="mcs-from-field" /></div>
                    </div>
                    <div class="col-sm-12 col-md-2 center-search-button"><button class="dropInnerButton search-btn" id="searchMUN">Search</button></div>
                  </form>
                </div>
              </div>
              <div class="az-links"></div>
            </div>
          </div>
          <div id="sitewide-menu" class="hidden masthead-subject">
            <div class="container sitewide-menu"></div>
          </div>
          <div id="audience-menu" class="hidden masthead-subject">
            <div class="container audience-menu"></div>
          </div>
          <!--APPLY AREA -->
          <div id="apply" class="hidden masthead-subject">
            <div class="container apply-menu"></div>
          </div><!-- LOGIN AREA -->
          <div id="login" class="hidden masthead-subject">
            <div class="container services-menu"></div>
          </div>
        </div>
      </div>
      <div id="masthead">
        <div class="container">
          <div class="row">
            <div class="col-sm-2 col-md-4"><a href="//www.mun.ca/main/" class="masthead-mun-logo" title="Memorial University of Newfoundland" aria-label="Memorial University"> Memorial University
              </a></div>
            <div class="col-sm-10 col-md-8">
              <div class="row">
                <div class="col-md-12">
                  <div id="masthead-actions" class="pull-right desktop-masthead-search">
                    <form method="get" action="//www.mun.ca/main/search.php"><input type="text" placeholder="SEARCH" class="ms-repace typeahead" name="q" autocomplete="off" id="ms-replace-search-input"><button type="submit" class="ms-replace" id="ms-search-btn"><span><!-- Search<br> --><span class="icon icon-search" aria-hidden="true"></span></span></button><input type="hidden" name="from" value="" id="mcs-from-field" /></form>
                    <div class="dropdown"><button type="button" id="jump-to" class="ms-replace dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Jump to <!--<br><span class="icon icon-chev-down"></span>--></span></button>
                      <ul id="jumpToMenu" class="ms-replace dropdown-menu dropdown-menu-right" aria-labelledby="jump-to">
                        <li><a href="http://www.mun.ca/people_departments/a_z_listing.php">A-Z
                            Directory</a></li>
                        <li><a href="http://www.mun.ca/main/become.php">Admissions</a></li>
                        <li><a href="http://www.mun.ca/regoff/calendar/">Calendar</a></li>
                        <li><a href="http://www.mun.ca/campus_map/">Campus Maps</a></li>
                        <li><a href="http://www.mun.ca/hr/careers/">Careers</a></li>
                        <li><a href="http://www.mun.ca/people_departments/academic.php">Faculties and
                            Schools</a></li>
                        <li><a href="http://www.mun.ca/international/">International</a></li>
                        <li><a href="https://www.library.mun.ca/">Libraries</a></li>
                        <li><a href="http://www.mun.ca/people_departments/">People and Departments</a></li>
                      </ul>
                    </div>
                    <div class="dropdown"><button type="button" id="btn-login" class="ms-replace dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Log<br>in <!-- <br><img src="key.png"> --></button><ul id="loginMenu"
class="ms-replace dropdown-menu dropdown-menu-right"
aria-labelledby="btn-login"><li><a href="https://my.mun.ca">my.mun.ca</a></li><li><a href="https://online.mun.ca">Online Learning</a></li><li><a href="https://www.mun.ca/memorial-self-service/">Self Service</a></li><li><a href="https://www.mun.ca/its/services/email/">Email</a></li><li><a href="http://www.mun.ca/iam/munlogin/">Other MUN Login Services</a></li></ul></div><!-- <button type="button" class="masthead-curtain-open" data-target="#login"--><!-- aria-label="Login"--><!-- title="Login" data-intro="Login Button" data-position="bottom">--><!-- <span>Login</span>-->
                        <!-- </button>-->
                        <!-- <button type="button" class="masthead-curtain-open site-search" data-target="#search"-->
                        <!-- aria-label="Search"-->
                        <!-- title="Search" data-intro="Search Button" data-position="right">-->
                        <!-- <span class="icon-search" aria-hidden="true"></span>-->
                        <!-- </button>-->
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <nav id="masthead-nav" typeof="SiteNavigationElement">
                      <ul class="nav navbar-nav pull-right" typeof="SiteNavigationElement">
                        <li><a property="url" href="http://www.mun.ca/alumni"><span property="name">Alumni</span></a></li>
                        <li><a property="url" href="//www.mun.ca/main/facultyandstaff.php"><span property="name">Faculty &amp; Staff</span></a></li>
                        <li><a property="url" href="//www.mun.ca/main/students.php"><span property="name">Students</span></a></li>
                        <li><a property="url" href="//www.mun.ca/main/visitors/index.php"><span property="name">Visitors</span></a></li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="site-title-desktop" class="site-title hidden-sm hidden-xs">
          <div class="container">
            <div class="row">
              <div class="col-md-12">
                <h1><a href="//www.mun.ca/covid19/">COVID-19</a></h1>
              </div>
            </div>
          </div>
        </div>
        <div id="menu">
          <nav class="navbar">
            <div class="container">
              <div class="navbar-header">
                <div class="pull-left"><a href="//www.mun.ca/main/"><img src="//clf.mun.ca/bedrock/public/assets/baratheon/images/MUN_Logo_RGB.png" class="mobile-mun-logo"></a></div>
                <div class="pull-right m-actions"><button type="button" class="masthead-curtain-open" data-target="#login" aria-label="Login" title="Login"><span class="text-btn">Login</span></button><button type="button" class="masthead-curtain-open" data-target="#audience-menu" aria-label="Audience Menu" title="Audience"><span class="icon-user" aria-hidden="true"></span></button><button type="button" class="masthead-curtain-open site-search" data-target="#search" aria-label="Search" title="Search"><span class="icon-search" aria-hidden="true"></span></button><button type="button" class="masthead-curtain-open navbar-toggle" data-target="#sitewide-menu" aria-label="Toggle navigation"><span class="icon-lines" aria-hidden="true"></span></button></div>
              </div>
              <nav id="top-menu" class="collapse navbar-collapse" typeof="SiteNavigationElement">
                <ul>
                  <li><a property="url" href="//www.mun.ca/covid19/overview"><span property="name">Overview & Risks</span></a></li>
                  <li><a property="url" href="//www.mun.ca/covid19/prevention"><span property="name">Prevention </span></a></li>
                  <li><a property="url" href="//www.mun.ca/covid19/travel"><span property="name">Travel Information & Advisories</span></a></li>
                  <li><a property="url" href="//www.mun.ca/covid19/ppc"><span property="name">Pandemic Preparedness Committee</span></a></li>
                </ul>
              </nav>
            </div>
          </nav>
        </div>
        <div id="site-title-mobile" class="site-title visible-sm visible-xs">
          <div class="container">
            <div class="row">
              <div class="col-xs-10">
                <h1><a href="//www.mun.ca/covid19/">COVID-19</a></h1>
              </div>
              <div class="col-xs-2"><button type="button" class="btn sub-menu-button pull-right" data-toggle="collapse" data-target="#sub-menu" aria-label="Toggle navigation" style="padding: 15px 5px 15px 0;"><span class="icon-chev-down" aria-hidden="true" style="color: white;"></span></button></div>
            </div>
          </div>
        </div>
    </header>
    <div id="mobile-menu-container">
      <div class="container">
        <div class="row">
          <nav class="sub-menu col-sm-12 collapse" id="sub-menu" typeof="SiteNavigationElement"></nav>
        </div>
      </div>
    </div>
    <style>
      @media (min-width: 768px) {

        figure.leader-board-banner,
        figure.leader-board-banner picture {
          height: 0;
          width: 0;
        }
      }
    </style>
    <style>
      @media (max-width: 767px) {

        figure.leader-board-banner,
        figure.leader-board-banner picture {
          height: 0;
          width: 0;
        }
      }
    </style>
    <div id="content-landing">
      <div class="container">
        <div class="row">
          <div class="col-md-7 col-md-offset-1 col-md-push-4">
            <div id="call-to-action-mobile-widget-container" data-type="MCT"></div>
            <div id="text-box" class="content-section">
              <h1>COVID-19 Information Hub</h1>
              <div typeof="WebPage">
                <main property="mainEntityOfPage">
                  <!-- SB START CONTENT -->
                  <h3>Current status:</h3>
                  <p>Everything is fine.</p>
                  <p><strong>The risk for exposure at Memorial University is low.</strong></p>
                  <p>Memorial has initiated its emergency operations centre (EOC) as outlined under the <a href="https://www.mun.ca/emergency/emergencyplans/">emergency management plan</a>. This group is responsible for planning, response, mitigation activities of the current COVID-19 issue for all Memorial&rsquo;s campuses. Planning is focussed on minimizing potential exposure while preserving the academic and research integrity of the current semester. This website will house all updates regarding the EOC&rsquo;s activities.</p>
                  <p>In addition, Memorial has re-established a Pandemic Preparedness Committee (PPC), last constituted during the H1N1 pandemic. The committee is directed by the Office of the Chief Risk Officer. The committee will work with provincial health officials and has overarching responsibility for managing the response to a possible pandemic.</p>
                  <p>The PPC has established several sub-groups to analyse and respond to specific issues that may arise as a result of the spread of COVID-19. These committees include:</p>
                  <ul>
                    <li><a href="ppc/academic/index.php">Academic</a></li>
                    <li><a href="ppc/continuity/index.php">Continuity Planning</a></li>
                    <li><a href="ppc/facilities-environment/index.php">Facilities/Security/Environmental Health and Safety</a></li>
                    <li><a href="ppc/hr-faculty/index.php">Human Resources/Faculty Relations</a></li>
                    <li><a href="ppc/international-travel/index.php">International Travel</a></li>
                    <li><a href="ppc/residences-ancillary/index.php">Student Residences and Ancillary Services</a></li>
                    <li><a href="ppc/life-wellness/index.php">Student Wellness/Student Life</a></li>
                    <li><a href="ppc/research/index.php">Research</a></li>
                  </ul>
                  <p>These subcommittees will work with the various stakeholders in these areas to prepare for the current and potential impacts of COVID-19.</p>
                  <p>Please continue to monitor <a href="https://www.mun.ca/covid19">https://www.mun.ca/covid19</a> for further updates.</p><!-- SB END CONTENT -->
                </main><!-- /property="mainEntityOfPage" -->
              </div><!-- /typeof="WebPage" -->
            </div><!-- /#text-box -->
            <!-- <div id="featured-news-feed-widget-container" data-type="MCT"></div>-->
            <div id="builder-news-feed-widget-container" data-type="MCT"></div>
          </div><!-- /.col -->
          <div class="col-md-4 col-md-pull-8">
            <div id="call-to-action-widget-container" data-type="MCT"></div>
            <!--<div id="extra-menu-widget-widget-container" data-type="MCT"></div>-->
            <!-- <div id="builder-news-feed-widget-container" data-type="MCT"></div>-->
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container -->
    </div><!-- /#content-landing-->
    <div id="quick-links-container"></div>
    <div id="contact">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <h1>Contact</h1>
            <h2>COVID-19</h2>
            <div class="address">
              <p>230 Elizabeth Ave, St. John's, NL, CANADA, A1B 3X9</p>
              <p>Postal Address: P.O. Box 4200, St. John's, NL, CANADA, A1C 5S7</p>
              <p>Tel: (709) 864-8000</p>
            </div>
            <ul class="contact-social-media">
              <li><a class="icon-twitter" href="#" target="_blank"></a></li>
              <li><a class="icon-facebook2" href="#" target="_blank"></a></li>
              <li><a class="icon-tumblr" href="#" target="_blank"></a></li>
              <li><a class="icon-linkedin2" href="#" target="_blank"></a></li>
              <li><a class="icon-flickr" href="#" target="_blank"></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <footer id="footer" typeof="WPFooter">
      <meta property="name" content="Page Footer" />
      <meta property="description" content="Important Links, Social, Copyright and Last Updated Content" />
      <div class="container">
        <div class="row">
          <div class="col-sm-6">
            <div id="footer-mun-logo"></div>
            <div>
              <ul class="footer-social-media" typeof="WebPageElement">
                <meta property="description" content="Social Media Links" />
                <li typeof="SiteNavigationElement"><a property="url" class="icon-twitter" href="https://twitter.com/MemorialU" target="_blank"><span property="name" class="label">Twitter</span>
                    <meta property="description" content="MemorialU Twitter Feed" /></a></li>
                <li typeof="SiteNavigationElement"><a property="url" class="icon-facebook2" href="https://www.facebook.com/MemorialUniversity" target="_blank"><span property="name" class="label">Facebook</span>
                    <meta property="description" content="MemorialU Facebook Page" /></a></li>
                <li typeof="SiteNavigationElement"><a property="url" class="icon-instagram" href="https://www.instagram.com/memorialuniversity/" target="_blank"><span property="name" class="label">Instagram</span>
                    <meta property="description" content="MemorialU Instagram Channel" /></a></li>
                <li typeof="SiteNavigationElement"><a property="url" class="icon-utubeSq" href="https://www.youtube.com/user/MemorialUVideos" target="_blank"><span property="name" class="label">Youtube</span>
                    <meta property="description" content="MemorialU Youtube Channel" /></a></li>
              </ul>
            </div>
          </div>
          <div class="col-sm-6">
            <hr />
            <ul class="footer-links" typeof="SiteNavigationElement">
              <li><a property="url" href="http://www.mun.ca/people_departments/a_z_listing.php"><span property="name">A-Z Directory</span></a></li>
              <li><a property="url" href="//www.mun.ca/main//accessibility.php"><span property="name">Accessibility</span></a></li>
              <li><a property="url" href="http://www.mun.ca/hr/careers/"><span property="name">Careers</span></a></li>
              <li><a property="url" href="http://www.mun.ca/people_departments/"><span property="name">Contact</span></a></li>
              <li><a property="url" href="http://www.mun.ca/emergency/"><span property="name">Emergency</span></a></li>
              <li><a property="url" href="http://www.mun.ca/iap/home/"><span property="name">Privacy</span></a></li>
              <li><a property="url" href="//www.mun.ca/covid19/feedback.php"><span property="name">Web Feedback</span></a></li>
            </ul>
            <hr />
          </div>
        </div>
        <div id="footer-links-bottom">
          <div class="row">
            <div class="col-sm-12">
              <ul class="extra-links">
                <li><a href="//www.mun.ca/covid19/siteMap.php" class="hideSiteMapLink">Site Map</a></li>
                <li><span class="hideSiteMapLink"> | </span><a href="https://builder.ucs.mun.ca/route.php?siteID=1626&sectionID=0&contentID=1&clcID=1" target="_blank">Last Updated: Mar 14, 2020</a></li>
              </ul>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <div class="copyright"><a href="http://www.mun.ca/copyright/website_copyright.php"> Copyright @ 2020 Memorial University of Newfoundland.
                </a></div>
            </div>
            <div class="col-sm-6">
              <div class="copyright-place"><a href="https://www.google.com/maps/search/Newfoundland+and+Labrador+Canada" target="_blank">Newfoundland and Labrador, Canada.</a></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <script src="//clf.mun.ca/bedrock/public/assets/baratheon/js/vendor.min.js?1568216557" defer></script>
    <script src="//clf.mun.ca/bedrock/public/assets/baratheon/js/template.min.js?1568216557" defer></script><span class="hidden" style="display: none" id="baratheon-search-config-map"
data-config="%7B%22localPath%22%3A%22%22%2C%22query%22%3A%22%22%2C%22fetchersPath%22%3A%22%5C%2Fappinclude%5C%2Fbedrock%5C%2Fpublic%5C%2Fsearch%5C%2Ffetchers%5C%2F%22%7D"></span><span class="hidden" id="baratheon-widget-map"
data-content="%5B%7B%22name%22%3A%22callToAction%22%2C%22url%22%3A%22%5C%2Fappinclude%5C%2Fbedrock%5C%2Fpublic%5C%2Fapi%5C%2Fv1%5C%2FextraMenuWidget.php%3Fid%3D1%26_sec%3Dfb9498bcde24d7080e7acfa313631a9446274fd2%26_ts%3D1584228347.4121%26_key%3D3ae1943c00647936ac8c7b1c8ffd7b5b%26_key2%3D2233a1895b8532427c713ba00c0f55d6%26_uid%3DAFEHVw%26_bid%3DGVoAAggVVltORFRWUExBRBQcWFVaW04%26_sid%3DGVoAAggVVltOVlQXWhZbHRREQBwbCBJHRU1Q%26_cid%3DGVoAAggVVltORFRWUExBRBQcWFVaW04%26_ens%3D0%26_ts2%3D1584228347.4029%22%2C%22options%22%3A%7B%22relocateOnSmallDevice%22%3Atrue%2C%22target%22%3A%22%23call-to-action-widget-container%22%7D%7D%2C%7B%22name%22%3A%22builderNewsFeed%22%2C%22url%22%3A%22%5C%2Fappinclude%5C%2Fbedrock%5C%2Fpublic%5C%2Fapi%5C%2Fv1%5C%2Fnews.php%3Factive%3D1%26items%3D2%26type%3Dnews%26_sec%3Dc36273a808ac2e72f11364c07e3378345669e76d%26_ts%3D1584228347.4123%26_key%3D867861c19c25564d1debbdd93be7bf66%26_key2%3Dc9dce1b2747cd6aa0e62d8987205817d%26_uid%3DA1EOCA%26_bid%3DGloJXQwXWQEbRVQMUR1PREIWC1VcCx4%26_sid%3DGloJXQwXWQEbV1RNW0dVHUJOExwdWEJCR0Rc%26_cid%3DGloJXQwXWQEbRVQMUR1PREIWC1VcCx4%26_ens%3D0%26_ts2%3D1584228347.4029%22%2C%22options%22%3A%7B%22title%22%3A%22News%22%2C%22target%22%3A%22%23builder-news-feed-widget-container%22%7D%7D%5D"></span><span class="hidden" id="site-template-url" data-content="/appinclude/_environment/sites/1626/baratheon/"></span><span class="hidden" style="display: none" id="baratheon-masthead-map"
data-content="%7B%22az%22%3A%7B%22data%22%3A%5B%7B%22A-Z%20Directory%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fpeople_departments%5C%2Fa_z_listing.php%22%2C%22Admissions%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fbecome.php%22%2C%22Calendar%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fregoff%5C%2Fcalendar%5C%2F%22%7D%2C%7B%22Campus%20Maps%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fcampus_map%5C%2F%22%2C%22Careers%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fhr%5C%2Fcareers%5C%2F%22%2C%22Faculties%20and%20Schools%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fpeople_departments%5C%2Facademic.php%22%7D%2C%7B%22International%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Finternational%5C%2F%22%2C%22Libraries%22%3A%22http%3A%5C%2F%5C%2Fwww.library.mun.ca%5C%2F%22%2C%22People%20and%20Departments%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fpeople_departments%5C%2F%22%7D%5D%2C%22size%22%3A%22col-xs-12%20col-sm-4%20col-lg-4%22%7D%2C%22audience%22%3A%7B%22data%22%3A%5B%7B%22Alumni%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2F%5C%2Falumni%5C%2F%22%2C%22Faculty%20%26amp%3B%20Staff%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Ffacultyandstaff.php%22%7D%2C%7B%22Students%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fstudents.php%22%7D%2C%7B%22Visitors%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fvisitors%5C%2F%22%7D%5D%2C%22size%22%3A%22col-md-12%20%20col-lg-4%22%7D%2C%22apply%22%3A%7B%22undergrad%22%3A%7B%22title%22%3A%22Undergraduate%22%2C%22body%22%3A%22Students%20who%20are%20looking%20to%20start%20or%20complete%20an%20undergraduate%20degree.%22%2C%22link%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fundergrad%5C%2F%22%2C%22apply_link%22%3A%22%7B%7BmemorialMainSite%7D%7D%5C%2Fundergrad%5C%2Fapply%5C%2F%22%2C%22button%22%3A%22Apply%22%7D%2C%22graduate%22%3A%7B%22title%22%3A%22Graduate%22%2C%22body%22%3A%22For%20people%20who%20are%20interested%20in%20starting%20a%20graduate%20diploma%2C%20master%5Cu2019s%20degree%20or%20doctoral%20program.%22%2C%22link%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fsgs%5C%2F%22%2C%22apply_link%22%3A%22%7B%7BmemorialMainSite%7D%7D%5C%2Fgraduate%5C%2Fapply%5C%2F%22%2C%22button%22%3A%22Apply%22%7D%2C%22online%22%3A%7B%22title%22%3A%22Online%22%2C%22body%22%3A%22For%20students%20who%20are%20looking%20to%20expand%20their%20learning%20on%20their%20own%20time%2C%20to%20fit%20their%20own%20schedules%2C%20from%20wherever.%22%2C%22link%22%3A%22https%3A%5C%2F%5C%2Fwww.citl.mun.ca%5C%2F%22%2C%22apply_link%22%3A%22https%3A%5C%2F%5C%2Fwww.citl.mun.ca%5C%2Flearning%5C%2Ffs%5C%2Fhowtoapply.php%22%2C%22button%22%3A%22Apply%22%7D%7D%2C%22services%22%3A%7B%22my.mun.ca%22%3A%22https%3A%5C%2F%5C%2Fmy.mun.ca%22%2C%22Online%20Learning%22%3A%22https%3A%5C%2F%5C%2Fonline.mun.ca%22%2C%22Self%20Service%22%3A%22https%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fmemorial-self-service%5C%2F%22%2C%22Email%22%3A%22https%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fits%5C%2Fservices%5C%2Femail%5C%2F%22%2C%22Other%20MUN%20Login%20Services%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fiam%5C%2Fmunlogin%5C%2F%22%7D%2C%22sitewide%22%3A%7B%22data%22%3A%5B%7B%22About%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fabout%5C%2F%22%2C%22Become%20A%20Student%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fbecome.php%22%2C%22Campuses%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fcampuses.php%22%7D%2C%7B%22Give%20to%20Memorial%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2F%5C%2Falumni%5C%2Fgive%5C%2F%22%2C%22Programs%22%3A%22%5C%2F%5C%2Fwww.mun.ca%5C%2Fmain%5C%2Fprograms.php%22%2C%22Research%22%3A%22http%3A%5C%2F%5C%2Fwww.mun.ca%5C%2Fresearch%5C%2F%22%7D%5D%2C%22size%22%3A%22col-md-12%20%20col-lg-6%22%7D%7D"></span>
    <meta name="mu" content="783.453125" />
    <meta name="mp" content="837.1796875" />
  </body>

</html>
`;

async function pollWebsite(): Promise<void> {
    const content = await fetch(INFORMATION_CENTRE_PATH);
    const text = pretty(await content.text());
    const patch = createPatch('COVID-19.html', oldData, text);
    const filenameDateStamp = moment().format('MMMM_Do_YYYY_h_mm_ss_a');
    const dateStamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    const filename = `COVID-19_${filenameDateStamp}.patch`;
    const gist = await octokit.gists.create({
        files: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            [filename]: {
                content: patch,
            },
        },
        description: `Changes as of ${dateStamp}`,
    });
    webhook.warn(
        'COVID-19 Bot',
        `MUN's [COVID-19 Information Centre](${INFORMATION_CENTRE_PATH}) has been updated. Diff: ${gist.data.html_url}`,
    );
}

pollWebsite();
