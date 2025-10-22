PSeudo code for qa test per flow:

login:
https://app.digitalschool.co.il
========

Profile:
https://app.digitalschool.co.il/members/test_live_student/
basically there is globally 2 compoennts that shares across all pages - header.php and buddypanel, we will cover them as well specfially

on profile page yoiu have 4 tabs yo ucan click on im copying the html raw html part to here:

```html
<ul>
  <li id="xprofile-personal-li" class="bp-personal-tab current selected">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/profile/"
      id="user-xprofile"
      class=""
    >
      <div class="bb-single-nav-item-point">פרופיל</div>
    </a>
  </li>

  <li id="settings-personal-li" class="bp-personal-tab" style="">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/settings/"
      id="user-settings"
      class=""
    >
      <div class="bb-single-nav-item-point">Account</div>
    </a>
  </li>

  <li id="notifications-personal-li" class="bp-personal-tab" style="">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/notifications/"
      id="user-notifications"
      class=""
    >
      <div class="bb-single-nav-item-point">Notifications</div>
    </a>
  </li>

  <li id="messages-personal-li" class="bp-personal-tab" style="">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/messages/"
      id="user-messages"
      class=""
    >
      <div class="bb-single-nav-item-point">Messages</div>
    </a>
  </li>

  <li id="courses-personal-li" class="bp-personal-tab">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/"
      id="user-courses"
      class=""
    >
      <div class="bb-single-nav-item-point">קורסים</div>
    </a>
  </li>

  <li id="friends-personal-li" class="bp-personal-tab">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/friends/"
      id="user-friends"
      class=""
    >
      <div class="bb-single-nav-item-point">חיבורים</div>
    </a>
  </li>

  <li id="certificates-personal-li-personal-li" class="bp-personal-tab">
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/certificates/"
      id="user-certificates-personal-li"
      class=""
    >
      <div class="bb-single-nav-item-point">תעודות</div>
    </a>
  </li>

  <li class="hideshow menu-item-has-children1" style="display: none;">
    <a class="more-button" href="#"
      ><i class="bb-icon-f bb-icon-ellipsis-h"></i
    ></a>
    <ul class="sub-menu"></ul>
  </li>
</ul>
```

# make sure to click the <div class="bb-single-nav-item-point">פרופיל</div> per each

Courses Page:
https://app.digitalschool.co.il/members/test_live_student/courses/
you have similir 4 tabs but for your own group of courses that open, the inital display is like 32 courses with pagianation but probaly we can lower it for better load time(or test for it) and we can test the tabs we made im copying the html part for it:

```html
<ul class="subnav">
  <li
    id="%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-ai-live-20-08-23-personal-li-personal-li"
    class="bp-personal-sub-tab"
    data-bp-user-scope="%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-ai-live-20-08-23"
  >
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-ai-live-20-08-23/"
      id="%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-ai-live-20-08-23-personal-li"
      class=""
    >
      מחזור לימוד קורס AI LIVE 20/08/23
    </a>
  </li>

  <li
    id="%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-digital-ai-%d7%9e%d7%aa%d7%a2%d7%93%d7%9b%d7%9f-personal-li-personal-li"
    class="bp-personal-sub-tab"
    data-bp-user-scope="%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-digital-ai-%d7%9e%d7%aa%d7%a2%d7%93%d7%9b%d7%9f"
  >
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-digital-ai-%d7%9e%d7%aa%d7%a2%d7%93%d7%9b%d7%9f/"
      id="%d7%9e%d7%97%d7%96%d7%95%d7%a8-%d7%9c%d7%99%d7%9e%d7%95%d7%93-%d7%a7%d7%95%d7%a8%d7%a1-digital-ai-%d7%9e%d7%aa%d7%a2%d7%93%d7%9b%d7%9f-personal-li"
      class=""
    >
      מחזור לימוד קורס DIGITAL AI מתעדכן
    </a>
  </li>

  <li
    id="general-courses-extra-personal-li-personal-li"
    class="bp-personal-sub-tab"
    data-bp-user-scope="general-courses-extra"
  >
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/general-courses-extra/"
      id="general-courses-extra-personal-li"
      class=""
    >
      General Courses Extra
    </a>
  </li>

  <li
    id="ai-extra-personal-li-personal-li"
    class="bp-personal-sub-tab"
    data-bp-user-scope="ai-extra"
  >
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/ai-extra/"
      id="ai-extra-personal-li"
      class=""
    >
      AI Extra
    </a>
  </li>

  <li
    id="my-courses-personal-li"
    class="bp-personal-sub-tab current selected"
    data-bp-user-scope="my-courses"
    style=""
  >
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/"
      id="my-courses"
      class=""
    >
      My קורסים
    </a>
  </li>

  <li
    id="certificates-personal-li"
    class="bp-personal-sub-tab"
    data-bp-user-scope="certificates"
    style=""
  >
    <a
      href="https://app.digitalschool.co.il/members/test_live_student/courses/certificates/"
      id="certificates"
      class=""
    >
      My Certificates
    </a>
  </li>

  <li class="hideshow menu-item-has-children1" style="display: none;">
    <a class="more-button" href="#"
      ><i class="bb-icon-f bb-icon-ellipsis-h"></i
    ></a>
    <ul class="sub-menu"></ul>
  </li>
</ul>
```

we need ot make sure not to look for hardcoded text because if we want totest with different users each will have on this specfic tabs different text per each tab/
another thing to test is the dispaly otpino lerandash has on deafult - here is the html part of it

```html
<div class="grid-filters" data-view="ld-course">
  <a
    href="#"
    class="layout-view layout-view-course layout-grid-view bp-tooltip active"
    data-view="grid"
    data-bp-tooltip-pos="up"
    data-bp-tooltip="Grid View"
  >
    <i class="dashicons dashicons-screenoptions" aria-hidden="true"></i>
  </a>

  <a
    href="#"
    class="layout-view layout-view-course layout-list-view bp-tooltip "
    data-view="list"
    data-bp-tooltip-pos="up"
    data-bp-tooltip="List View"
  >
    <i class="dashicons dashicons-menu" aria-hidden="true"></i>
  </a>
</div>
```

and since there is pagaination we can check it aswell:

```html
<div class="bb-lms-pagination">
  <a
    class="prev page-numbers"
    href="https://app.digitalschool.co.il/members/test_live_student/courses/page/1/?type=my-courses&amp;current_page=2&amp;request_url=https%3A%2F%2Fapp.digitalschool.co.il%2Fmembers%2Ftest_live_student%2Fcourses&amp;order=DESC&amp;orderby=ID&amp;action=buddyboss_lms_get_courses&amp;_wpnonce=5cedf09676"
    >» קודם</a
  >
  <a
    class="page-numbers"
    href="https://app.digitalschool.co.il/members/test_live_student/courses/page/1/?type=my-courses&amp;current_page=2&amp;request_url=https%3A%2F%2Fapp.digitalschool.co.il%2Fmembers%2Ftest_live_student%2Fcourses&amp;order=DESC&amp;orderby=ID&amp;action=buddyboss_lms_get_courses&amp;_wpnonce=5cedf09676"
    ><span class="screen-reader-text">Page </span>1</a
  >
  <span aria-current="page" class="page-numbers current"
    ><span class="screen-reader-text">Page </span>2</span
  >
</div>
```

Connections page:(friends)

https://app.digitalschool.co.il/members/test_live_student/friends/

this page is like connections on linken in people cna friend each otjher - possible things i see is 2 button "My connections" and "Requests" there is also filters i include the htmls: 
```html
<ul class="subnav">
		
		
			<li id="friends-my-friends-personal-li" class="bp-personal-sub-tab current selected" data-bp-user-scope="my-friends">
				<a href="https://app.digitalschool.co.il/members/test_live_student/friends/" id="friends-my-friends" class="">
					My Connections				</a>

							</li>

		
			<li id="requests-personal-li" class="bp-personal-sub-tab" data-bp-user-scope="requests">
				<a href="https://app.digitalschool.co.il/members/test_live_student/friends/requests/" id="requests" class="">
					Requests				</a>

							</li>

		
	<li class="hideshow menu-item-has-children1" style="display: none;"><a class="more-button" href="#"><i class="bb-icon-f bb-icon-ellipsis-h"></i></a><ul class="sub-menu"></ul></li></ul>

    <div class="subnav-filters filters no-ajax" id="subnav-filters">
		<div class="grid-filters" data-object="friends">
		<a href="#" class="layout-view layout-grid-view bp-tooltip active" data-view="grid" data-bp-tooltip-pos="up" data-bp-tooltip="Grid View"> <i class="bb-icon-l bb-icon-grid-large" aria-hidden="true"></i> </a>

		<a href="#" class="layout-view layout-list-view bp-tooltip " data-view="list" data-bp-tooltip-pos="up" data-bp-tooltip="List View"> <i class="bb-icon-l bb-icon-bars" aria-hidden="true"></i> </a>
	</div>
	
<div id="dir-filters" class="component-filters clearfix">
	<div id="members-friends-select" class="last filter">
		<label class="bp-screen-reader-text" for="members-friends">
			<span>Show:</span>
		</label>
		<div class="select-wrap">
			<select id="members-friends" data-bp-filter="friends">
				<option value="active">Recently Active</option>
<option value="newest">Newest Members</option>
<option value="alphabetical">Alphabetical</option>
			</select>
			<span class="select-arrow" aria-hidden="true"></span>
		</div>
	</div>
</div>
</div>
```

Certifcates page:
https://app.digitalschool.co.il/members/test_live_student/certificates/

tis is a custom page we built that based on the original buddyboss theme one, that will display certifcates for finished courses of students, 


Edit Profile page: 
https://app.digitalschool.co.il/members/test_live_student/profile/edit/group/1/
here is also buddyboss we didnt change much, we added some custom fields but there is the single and multi fields settigns that a maybe need to hide or rename because its unclear ill shar the html 
the edit form: ```html 
#profile-edit-form

<ul class="button-tabs button-nav">
					<li class="current"><a href="https://app.digitalschool.co.il/members/test_live_student/profile/edit/group/1/">General Info</a></li><li><a href="https://app.digitalschool.co.il/members/test_live_student/profile/edit/group/2/">Single Fields</a></li><li><a href="https://app.digitalschool.co.il/members/test_live_student/profile/edit/group/3/">Multi Fields</a></li>				</ul>

```



Course Page: 
https://app.digitalschool.co.il/courses/chatgpt/

on this file 