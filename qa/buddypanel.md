<aside class="buddypanel buddypanel--toggle-off ">
    <div class="side-panel-inner">
       <nav class="side-panel-menu-container">
             <ul id="buddypanel-menu" class="borders buddypanel-menu side-panel-menu">
                <!-- MAIN MENU ITEMS -->
                <hr>
                <li id="menu-item-100030583" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                   <a href="https://app.digitalschool.co.il/members/supportecomschool-co-il/courses/" class="bb-menu-item" data-balloon-pos="right" data-balloon="הקורס שלי">
                   <i class="_mi _before bb-icon-graduation-cap" aria-hidden="true"></i>
                   <span>הקורס שלי</span>
                   </a>
                </li>
                <li id="menu-item-100030580" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                   <a href="https://app.digitalschool.co.il/members/supportecomschool-co-il/" class="bb-menu-item" data-balloon-pos="right" data-balloon="הפרופיל שלי">
                   <i class="_mi _before bb-icon-user" aria-hidden="true"></i>
                   <span>הפרופיל שלי</span>
                   </a>
                </li>
                <?php if (user_has_instructor_access()): ?>
                     <li id="menu-item-instructor-dashboard" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                           <a href="<?= esc_url(site_url('/instructor-dashboard')) ?>" class="bb-menu-item" data-balloon-pos="right" data-balloon="ניהול מרצה">
                           <i class="_mi _before bb-icon-briefcase" aria-hidden="true"></i>
                           <span>ניהול מרצה</span>
                           </a>
                     </li>
                  <?php endif; ?>

                <!-- LAST COURSES for Non-Admins with progress -->
                <?php echo get_recent_courses_menu_html(get_current_user_id()); ?>
                <!-- SETTINGS MENU ITEMS -->
                <hr>
                <li id="menu-item-settings" class="menu-item menu-item-has-children open current-menu-parent" style="min-height: 35px;">
                   <a href="#" class="bb-menu-item dropdown-toggle" data-balloon-pos="right" data-balloon="הגדרות">
                   <span>הגדרות</span>
                   <i class="bb-icon-l bb-icon-angle-down bs-submenu-toggle"></i></a>
                   <ul class="sub-menu">
                      <li id="menu-item-100039757" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                         <a href="https://app.digitalschool.co.il/technical-support-guide/" class="bb-menu-item" data-balloon-pos="right" data-balloon="תמיכה מקצועית">
                         <i class="_mi _before bb-icon-tools" aria-hidden="true"></i>
                         <span>תמיכה מקצועית</span>
                         </a>
                      </li>
                      <li id="menu-item-100039707" class="menu-item menu-item-type-post_type menu-item-object-page current-menu-item" style="min-height: 35px;">
                         <a href="https://app.digitalschool.co.il/tickets/" class="bb-menu-item" data-balloon-pos="right" data-balloon="פניות ואישורים">
                         <i class="_mi _before bb-icon-file-attach" aria-hidden="true"></i>
                         <span>פניות ואישורים</span>
                         </a>
                      </li>
                      <li id="menu-item-100030903" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                         <a href="https://app.digitalschool.co.il/placement/" class="bb-menu-item" data-balloon-pos="right" data-balloon="השמה">
                         <i class="_mi _before bb-icon-briefcase" aria-hidden="true"></i>
                         <span>השמה</span>
                         </a>
                      </li>
                      <li id="menu-item-100039823" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                         <a href="https://app.digitalschool.co.il/grades/" class="bb-menu-item" data-balloon-pos="right" data-balloon="ציונים">
                         <i class="_mi _before bb-icon-book-open" aria-hidden="true"></i>
                         <span>ציונים</span>
                         </a>
                      </li>
                   </ul>
                </li>
                <!-- FOOTER MENU ITEMS -->
                <hr>
                <li id="menu-item-100054153" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                   <a href="https://app.digitalschool.co.il/%d7%9e%d7%a9%d7%95%d7%912/" class="bb-menu-item" data-balloon-pos="right" data-balloon="משוב">
                   <i class="_mi _before bb-icon-airplay" aria-hidden="true"></i>
                   <span>משוב</span>
                   </a>
                </li>
                <li id="menu-item-100052205" class="menu-item menu-item-type-post_type menu-item-object-page" style="min-height: 35px;">
                   <a href="https://app.digitalschool.co.il/wp-login.php?action=logout&amp;redirect_to=https%3A%2F%2Fapp.digitalschool.co.il%2Ftickets%2F&amp;_wpnonce=d15f95063a" class="bb-menu-item" data-balloon-pos="right" data-balloon="התנתק">
                   <i class="_mi _before bb-icon-sign-out" aria-hidden="true"></i>
                   <span>התנתק</span>
                   </a>
                </li>
             </ul>
       </nav>
    </div>
 </aside>

 <script>
(function() {
      document.addEventListener('DOMContentLoaded', () => {
         const panel = document.querySelector('.buddypanel');
         if (!panel) return;

         const toggles = panel.querySelectorAll('.dropdown-toggle');

         toggles.forEach(toggle => {
            toggle.addEventListener('click', e => {
               e.preventDefault();

               const li = toggle.closest('li');
               const submenu = li.querySelector('.sub-menu');

               if (!submenu) return;

               const isOpen = submenu.classList.contains('bb-open');

               // 🔧 Only toggle this submenu
               if (isOpen) {
               submenu.classList.remove('bb-open');
               } else {
               submenu.classList.add('bb-open');
               }

               toggle.setAttribute('aria-expanded', String(!isOpen));
            });
         });
      });
})();
</script>


<?php
/**
 * BuddyPanel Mobile Template
 * -------------------------------------
 * Standalone mobile panel (no BuddyBoss dependency)
 * Works with buddypanel-custom.php desktop version.
 */

?>

<!-- 📱 MOBILE HEADER -->
<div class="bb-mobile-header-wrapper bb-single-icon">
  <div class="bb-mobile-header flex align-items-center bb-mobile-header-flex">
    
    <!-- Hamburger icon -->
    <div class="bb-left-panel-icon-wrap">
      <a href="#" class="push-left bb-left-panel-mobile" aria-label="פתיחת תפריט">
        <i class="bb-icon-l bb-icon-bars"></i>
      </a>
    </div>

    <!-- Logo (optional dynamic site logo) -->
    <div class="flex-1 mobile-logo-wrapper">
      <div class="site-title">
        <a href="<?php echo esc_url(home_url('/')); ?>" rel="home">
          <?php if (function_exists('the_custom_logo')) the_custom_logo(); ?>
        </a>
      </div>
    </div>

    <!-- Search icon -->
    <div class="header-aside">
      <a data-balloon-pos="left" data-balloon="Search" href="#" class="push-right header-search-link">
        <i class="bb-icon-l bb-icon-search"></i>
      </a>
    </div>
  </div>

  <!-- Search overlay -->
  <div class="header-search-wrap">
    <div class="container">
      <form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
        <label>
          <span class="screen-reader-text"><?php esc_html_e('Search for:', 'buddyboss-child'); ?></span>
          <input type="search" class="search-field-top" placeholder="<?php esc_attr_e('Search', 'buddyboss-child'); ?>" value="" name="s" autocomplete="off">
        </label>
        <input type="hidden" name="bp_search" value="1">
        <input type="hidden" name="view" value="content">
      </form>
      <a data-balloon-pos="left" data-balloon="Close" href="#" class="close-search">
        <i class="bb-icon-l bb-icon-times"></i>
      </a>
    </div>
  </div>
</div>


<!-- 📱 MOBILE SLIDE-IN PANEL -->
<div class="bb-mobile-panel-wrapper left light">
  <div class="bb-mobile-panel-inner">

    <!-- User header -->
    <div class="bb-mobile-panel-header">
      <div class="user-wrap">
        <?php
        $user_id = get_current_user_id();
        $user_info = get_userdata($user_id);
        $avatar = get_avatar_url($user_id, ['size' => 100]);
        ?>
        <a href="<?php echo esc_url(get_author_posts_url($user_id)); ?>">
          <img alt="<?php echo esc_attr($user_info->display_name); ?>" src="<?php echo esc_url($avatar); ?>" class="avatar avatar-100 photo" height="100" width="100">
        </a>
        <div>
          <a href="<?php echo esc_url(get_author_posts_url($user_id)); ?>">
            <span class="user-name"><?php echo esc_html($user_info->display_name); ?></span>
          </a>
          <div class="my-account-link">
            <a class="ab-item" href="<?php echo esc_url(site_url('/members/' . $user_info->user_login . '/settings/')); ?>">
              <?php esc_html_e('My Account', 'buddyboss-child'); ?>
            </a>
          </div>
        </div>
      </div>

      <!-- Close icon -->
      <a href="#" class="bb-close-panel" aria-label="סגור תפריט">
        <i class="bb-icon-l bb-icon-times"></i>
      </a>
    </div>

    <!-- Mobile menu -->
    <nav class="main-navigation" data-menu-space="120">
      <ul class="bb-primary-menu mobile-menu buddypanel-menu side-panel-menu">
        <li><a href="<?php echo esc_url(site_url('/members/' . $user_info->user_login . '/courses/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-graduation-cap"></i><span>הקורס שלי</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/technical-support-guide/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-tools"></i><span>תמיכה מקצועית</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/members/' . $user_info->user_login . '/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-user"></i><span>הפרופיל שלי</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/tickets/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-file-attach"></i><span>פניות ואישורים</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/placement/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-briefcase"></i><span>השמה</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/main-groups/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-users"></i><span>קבוצות</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/blog/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-article"></i><span>בלוג איקום</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/grades/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-book-open"></i><span>ציונים</span></a></li>
        <li><a href="<?php echo esc_url(site_url('/משוב/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-newspaper"></i><span>משוב</span></a></li>
        <li><a href="<?php echo wp_logout_url(site_url('/')); ?>" class="bb-menu-item"><i class="bb-icon-l bb-icon-sign-out"></i><span>התנתק</span></a></li>
      </ul>
    </nav>

  </div>
</div>