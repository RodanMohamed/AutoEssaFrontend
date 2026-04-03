I want to create a website called Auto Essa for Renting and Saling car but the payment process not done in my website, 
i need to do it using .Net 10,EF Core,Angular and i need also to practice and then the deployment but give me one by one start ith the backend 
and explain each step u will do.

My Core Pages
1. Landing Page
Hero section (headline + CTA like “Browse Cars”)
Featured cars 
Categories (Rent / Buy )
Why choose us (trust points)
Testimonials
Quick search bar (very important)

2. Cars Listing Page
Filters:
Price range
Car type (SUV, Sedan…)
Rent / Buy
Fuel type
Sorting (price, newest, popularity)
Grid + list view
3. Car Details Page

This is VERY important for conversions

High-quality images (gallery + zoom)
Car specs:
Model, year, mileage, transmission
Availability (for rent)
Price (per day / total)
Contact button (WhatsApp / phone / form)
Location map

4. About Page
Your story (build trust)
Mission & vision
Why users should trust you
Team (optional)

5. Contact Page
Contact form (name, phone, message)
WhatsApp button (VERY important in Egypt)
Phone number
Google Maps location
Working hours
Admin Dashboard (important features)

Car Management
Add / edit / delete cars
Upload multiple images
Set:
Rent or sale
Price
Availability status
Leads Management

Since no payment:

Store user inquiries
See:
Name
Phone
Car interested in
Mark as:
New / Contacted / Closed
Content Management
Edit homepage content
Manage testimonials
Manage featured cars

Smart Features
1. “Request a Car” Feature
User can request a car that’s not listed.

2. Favorites / Wishlist

Users can save cars ❤️
Save cars per user

3. WhatsApp Integration

Instead of payment:

“Book via WhatsApp”

Pre-filled message:

“Hi, I’m interested in this car…”

4. Booking Request (No Payment)
User selects:
Dates (for rent)
Submit request
You contact them manually

5. Reviews & Ratings
Helps build trust

7. Multi-language (Arabic + English)

Authentication 
User accounts:
Save favorites
Track requests
Admin login (secure)



Since no online payment, your goal is:
 Turn visitors into leads (calls / messages)

So always:

Add CTA buttons everywhere
Make contact super easy
Show trust signals

BackEnd REQUIREMENTS (already created  ):
see 
https://autoessa-bmgwd0fgd9cbb9en.polandcentral-01.azurewebsites.net/scalar/v1

.Net 10 
3 layers architecture (PL, BLL, DAL)
Unit Testing
Integration testing with test containers to mimic the database and Blob storage
Database: microsoft SQL server Database


1. Presentation Layer (API)
ASP.NET Core Web API
that  Handles:
Controllers
DTOs
FluentValidation
Auth

2. Business Layer (Application / Services)
Business logic lives here
Use:
Services 
Interfaces 
AutoMapper
Dependency Injection

3. Data Access Layer (EF Core)
Database logic
Repository pattern
IUnit of work pattern
EF Core DbContext
Models/Entities
Migrations
this is my server name: RODAN\SQLEXPRESS

1. Email / Notifications (Optional)
Use:
SMTP (Gmail)
or SendGrid
 Logging & Monitoring


FrontEnd Requirements:
Frontend (Angular) → UI + user interaction
Backend (.NET 3-layer) → API + logic + database
 Angular talks to your my via HTTP (REST)
 use Feature-based structure
 Tailwind CSS for styling
 Dont use imojis or icons in the UI, use SVGs or icon libraries.
 UI must be professional and follow scientific ux methodologies
 Guards 
 Routing
 Models (Interfaces)




As a user, I want to view a landing page so that I can quickly understand the platform and browse featured cars.
As a user, I want to search for cars by name, type, or price so that I can find suitable options.
As a user, I want to filter cars (rent / buy / price / type) so that I can narrow down my choices. 
As a user, I want to view detailed information about a car so that I can decide whether to rent or buy it.
As a user, I want to see images of the car so that I can evaluate its condition and features.
As a user, I want to contact the seller via WhatsApp or phone so that I can inquire about the car.
As a user, I want to view all the location for this place and when it opens.
As a user, I want to send a booking request for a car so that the company can contact me.
As a user, I want to choose rental dates so that I can reserve the car.
As a user, I want to contact the company via form or WhatsApp so that I can quickly communicate.
As a user, I want to register and login so that I can manage my requests.
As a user, I want to save favorite cars so that I can review them later.
As a user, I want to view my booking requests so that I can track their status.
As a user, I want the website to support Arabic and English so that I can use it comfortably.
As a user, I want the website to be fast and responsive so that I can browse easily on mobile.

As an admin, I want to add new cars so that they appear on the website.
As an admin, I want to edit car details so that I can update price, availability, or specs.
As an admin, I want to delete cars so that I can remove unavailable listings.
As an admin, I want to upload multiple images for each car so that users can see full details.
As an admin, I want to view all booking requests so that I can contact customers.
As an admin, I want to see user details (name, phone, car selected) so that I can follow up.
As an admin, I want to update request status (New / Contacted / Closed) so that I can track progress.
As an admin, I want to view registered users so that I can manage the platform.
As an admin, I want to block or delete users if needed.
As an admin, I want to manage featured cars so that I can highlight important listings.
As an admin, I want to update homepage content so that the site stays fresh.
As an admin, I want secure login so that only authorized users access the dashboard.
As an admin, I want role-based access so that permissions are controlled.
