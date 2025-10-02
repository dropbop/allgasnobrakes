# Photo Management Guide for AllGasNoBrakes Photography

## Quick Start
To add or update photos on the website, you'll be working with two folders in the GitHub repository:
- **Desktop photos**: `static/photos/desktop/`
- **Mobile photos**: `static/photos/mobile/`

The website automatically displays all photos from these folders - no coding required!

### 🎯 Key Features:
- **Automatic carousel** on home page (first photos in each folder)
- **Category filtering** on portfolio page (supercars, classic, sports, studio)
- **Alphabetical sorting** by filename

---

## Photo Directory Structure

```
static/
└── photos/
    ├── desktop/     # Full-size photos for desktop viewing
    │   ├── 001-ferrari812-Tokyo.jpg
    │   ├── 002-Pista-ArmWrks.jpg
    │   └── ...
    └── mobile/      # Optimized photos for mobile devices
        ├── 001-812tokyo-mobile.jpg
        ├── 002-svjyellow-mobile.jpg
        └── ...
```

### Important Notes:
- Photos are displayed in **alphabetical order** by filename
- Both desktop and mobile versions should be provided for best performance
- Files with "about_me" in the name are reserved for the About page

---

## Adding Photos via GitHub (Web Browser)

### Method 1: Upload New Photos

1. **Navigate to the photo folder**:
   - Go to [github.com/dropbop/allgasnobrakes](https://github.com/dropbop/allgasnobrakes)
   - Click on `static` → `photos` → `desktop` (or `mobile`)

2. **Upload your photos**:
   - Click the "Add file" button → "Upload files"
   - Drag and drop your photos or click "choose your files"
   - You can upload multiple photos at once

3. **Commit your changes**:
   - Add a commit message like "Add new automotive photos"
   - Click "Commit changes"

4. **The website updates automatically!**

### Method 2: Replace Existing Photos

1. **Navigate to the specific photo**:
   - Go to the photo you want to replace
   - Click on the photo file name

2. **Delete the old photo**:
   - Click the trash can icon
   - Commit with message "Remove old photo"

3. **Upload the new photo**:
   - Follow the upload steps above
   - Use the **same filename** to maintain order

---

## Photo Naming Convention

### Standard Format (No Category):
```
Desktop: [number]-[description]-[location].jpg
Mobile:  [number]-[description]-mobile.jpg
```

### Category Format (For Portfolio Filtering):
```
Desktop: [category]-[number]-[description].jpg
Mobile:  [category]-[number]-[description]-mobile.jpg
```

### Available Categories:
- `supercars` - Lamborghini, Ferrari, McLaren, etc.
- `classic` - Vintage and classic cars
- `sports` - Sports cars and performance vehicles
- `studio` - Studio/indoor photography

### Examples:
- `supercars-001-ferrari812-Tokyo.jpg` (goes in Supercars category)
- `classic-001-mustang67.jpg` (goes in Classic Cars category)
- `sports-001-porsche911.jpg` (goes in Sports Cars category)
- `studio-001-mclaren-indoor.jpg` (goes in Studio category)
- `001-randomcar.jpg` (no category - shows in "All Work")

### Tips:
- Use numbers (001, 002, 003) to control display order within categories
- Category prefix must be exact: `supercars-`, `classic-`, `sports-`, or `studio-`
- Photos without category prefix appear only when "All Work" is selected
- Keep names descriptive but concise
- Use hyphens (-) instead of spaces

---

## Photo Requirements

### Supported Formats:
- `.jpg` or `.jpeg` (recommended)
- `.png`
- `.webp` (best compression)
- `.avif` (newest format, great quality)

### Recommended Sizes:
- **Desktop**: 1920x1280px or larger (will be resized by browser)
- **Mobile**: 800x600px (optimized for fast loading)

### File Size Guidelines:
- **Desktop**: Keep under 2MB per photo
- **Mobile**: Keep under 500KB per photo
- Use image optimization tools if needed

---

## Managing Photo Order

Photos are displayed alphabetically by filename. To control the order:

### Reordering Photos:
1. **Rename files** with different numbers:
   - `001-ferrari.jpg` → appears first
   - `002-mclaren.jpg` → appears second
   - `003-porsche.jpg` → appears third

### Inserting Photos Between Others:
- Use decimal numbers: `001.5-newcar.jpg`
- Or renumber all files to make space

---

## Common Tasks

### ✅ Control Home Page Carousel:
- **Desktop carousel**: Photos from `static/photos/desktop/` are loaded automatically
- **Mobile carousel**: First 3-5 photos from `static/photos/mobile/` appear
- **To change carousel photos**: Rename files so desired photos appear first alphabetically
- Example: Rename to `001-featured-ferrari.jpg`, `002-featured-lambo.jpg`

### ✅ Add photos with categories:
1. Name file with category prefix: `supercars-001-ferrari.jpg`
2. Upload to `static/photos/desktop/`
3. Upload mobile version: `supercars-001-ferrari-mobile.jpg`
4. Photo will appear in "Supercars" filter on portfolio page

### ✅ Add photos to portfolio:
1. Upload to `static/photos/desktop/`
2. Upload mobile version to `static/photos/mobile/`
3. Commit changes

### ✅ Remove photos:
1. Navigate to the photo
2. Click delete (trash icon)
3. Commit the deletion

### ✅ Update the About page photo:
- Upload a file with "about_me" in the name
- Example: `about_me_photo_AGNB.JPG`

### ✅ Batch upload multiple photos:
1. Select all photos on your computer
2. Drag them all at once to GitHub
3. Commit all changes together

---

## Troubleshooting

### Photos not showing up?
- Check the file extension is supported (.jpg, .png, etc.)
- Ensure the filename doesn't have special characters
- Verify the photo is in the correct folder

### Categories not working?
- Category prefix must be exact: `supercars-`, `classic-`, `sports-`, or `studio-`
- Include hyphen after category: `supercars-001` ✅ not `supercars001` ❌
- Category must be lowercase

### Carousel not updating?
- The carousel shows the FIRST photos alphabetically
- Rename your featured photos to start with lower numbers (001, 002)
- Desktop and mobile carousels are separate - update both folders

### Photos in wrong order?
- Check the filename starts with numbers
- Rename files to change order
- Remember: 001 comes before 010 which comes before 100

### Site not updating?
- GitHub Pages can take 2-5 minutes to update
- Try hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### Photos loading slowly?
- Optimize images before uploading
- Use mobile versions for the mobile folder
- Consider using .webp format for better compression

---

## Pro Tips

1. **Batch Processing**: Upload multiple photos at once to save time
2. **Consistent Naming**: Stick to one naming pattern for easy management
3. **Keep Originals**: Always keep backup copies of original photos
4. **Test on Mobile**: Check how photos look on phone after uploading
5. **Seasonal Updates**: Create folders locally for different shoots/seasons

---

## Need Help?

- For technical issues: Contact the developer
- For GitHub access: Make sure you're logged in with the right account
- Repository: [github.com/dropbop/allgasnobrakes](https://github.com/dropbop/allgasnobrakes)

---

*Last updated: October 2025*