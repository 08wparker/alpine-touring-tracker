#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import os
import sys
import gzip

def is_in_haute_route_region(lat, lon):
    """Check if coordinates are in the Haute Route region (lat 45.8-46.2, lng 6.8-7.8)"""
    return 45.8 <= lat <= 46.2 and 6.8 <= lon <= 7.8

def parse_gpx_file(file_path):
    """Parse GPX file and return track points in Haute Route region"""
    try:
        # Handle gzipped files
        if file_path.endswith('.gz'):
            with gzip.open(file_path, 'rt', encoding='utf-8') as f:
                content = f.read()
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        
        root = ET.fromstring(content)
        
        # Find all track points
        points_in_region = []
        namespaces = {'gpx': 'http://www.topografix.com/GPX/1/1'}
        
        # Get track name
        track_name = ""
        track_elem = root.find('.//gpx:trk/gpx:name', namespaces)
        if track_elem is not None:
            track_name = track_elem.text or ""
        
        # Find all track points
        for trkpt in root.findall('.//gpx:trkpt', namespaces):
            lat = float(trkpt.get('lat'))
            lon = float(trkpt.get('lon'))
            
            if is_in_haute_route_region(lat, lon):
                points_in_region.append((lat, lon))
        
        return track_name, points_in_region
    
    except Exception as e:
        return None, []

def main():
    # Activities we identified from the CSV
    activities = [
        ("4847924210", "Bluebird backcountry sesh"),
        ("5093530416", "A few turns, earned"),
        ("5099006791", "More earned turns"),
        ("8545914479", "Afternoon Activity"),
        ("8650598950", "Evening Activity"),
        ("8906999643", "Epic day 1 in the Berner"),
        ("8912500044", "Morning Backcountry Ski"),
        ("8918870224", "Trugberg- Berner day 3"),
        ("8923545365", "Morning Backcountry Ski"),
        ("8934764294", "Afternoon Backcountry Ski"),
        ("8934764827", "Exit from Berner Oberland"),
        # Also check some Alpine Ski activities
        ("1414871068", "Last day steamy 2k18"),
        ("2185743860", "Arlberg- AM"),
        ("3063057074", "Morning steamboat sesh"),
        ("4788733470", "Afternoon Activity"),
        ("4792198260", "Morning Activity"),
        ("4804302180", "Afternoon Activity"),
        ("5104023142", "Quick last downhill lap in steamboat"),
        ("8387377448", "Shred w James and some magic carpet reps w Rose"),
        ("8399092558", "Afternoon Activity"),
    ]
    
    base_path = "/Users/williamparker/Desktop/alpine_touring_tracker/bulk_export_stava_example/export_28330904/activities"
    
    haute_route_activities = []
    
    for activity_id, activity_name in activities:
        # Try different file extensions
        for ext in ['.gpx', '.fit.gz', '.tcx.gz']:
            file_path = os.path.join(base_path, f"{activity_id}{ext}")
            if os.path.exists(file_path):
                if ext == '.gpx':  # Only process GPX files for now
                    track_name, points = parse_gpx_file(file_path)
                    if points:
                        print(f"FOUND HAUTE ROUTE ACTIVITY:")
                        print(f"  ID: {activity_id}")
                        print(f"  Name: {activity_name}")
                        print(f"  Track Name: {track_name}")
                        print(f"  Points in region: {len(points)}")
                        print(f"  Sample coordinates: {points[:3]}")
                        print(f"  File: {file_path}")
                        print()
                        haute_route_activities.append((activity_id, activity_name, track_name, len(points)))
                break
    
    print(f"\nSUMMARY:")
    print(f"Total activities checked: {len(activities)}")
    print(f"Activities in Haute Route region: {len(haute_route_activities)}")
    
    if haute_route_activities:
        print("\nHaute Route Activities:")
        for activity_id, activity_name, track_name, point_count in haute_route_activities:
            print(f"  - {activity_id}: {activity_name} ({track_name}) - {point_count} points")

if __name__ == "__main__":
    main()