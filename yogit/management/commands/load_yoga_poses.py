import requests
from django.core.management.base import BaseCommand
from yogit.models import Pose, PoseType


class Command(BaseCommand):
    help = 'Load yoga poses from API and save to database'

    def handle(self, *args, **options):
        categories_response = requests.get('https://yoga-api-nzy4.onrender.com/v1/categories')
        categories_response.raise_for_status()
        categories_data = categories_response.json()

        for category_data in categories_data:
            # Create or get PoseType object
            pose_type_id = category_data['id']
            try:
                pose_type = PoseType.objects.get(id=pose_type_id)
            except PoseType.DoesNotExist:
                pose_type = PoseType.objects.create(
                    id=pose_type_id,
                    name=category_data['category_name'],
                    description=category_data['category_description']
                )

            # Create or update Pose objects for this PoseType
            for pose_data in category_data['poses']:
                pose_id = pose_data['id']

                # Iterate through all poses by level to find and assign the right difficulty to Pose
                # as this data is unfortunately not provided when looking up the pose itself :(
                for level in ("beginner", "intermediate", "expert"):
                    difficulty_response = requests.get(f'https://yoga-api-nzy4.onrender.com/v1/poses?level={level}')
                    difficulty_response.raise_for_status()
                    difficulty_data = diff_response.json()
                    for pose in difficulty_data["poses"]:
                        if pose_id == pose["id"]:
                            difficulty_level = level

                pose_response = requests.get(f'https://yoga-api-nzy4.onrender.com/v1/poses?id={pose_id}')
                pose_response.raise_for_status()
                pose_data = pose_response.json()

                # Update or create Pose object
                pose, created = Pose.objects.update_or_create(
                    id=pose_id,
                    defaults={
                        'english_name': pose_data['english_name'],
                        'sanskrit_name_adapted': pose_data['sanskrit_name_adapted'],
                        'sanskrit_name': pose_data['sanskrit_name'],
                        'translation_name': pose_data['translation_name'],
                        'pose_benefits': pose_data['pose_benefits'],
                        'pose_description': pose_data['pose_description'],
                        'difficulty_level': difficulty_level,
                        'url_svg': pose_data['url_svg'],
                        'url_png': pose_data['url_png'],
                        'url_svg_alt': pose_data['url_svg_alt'],
                    }
                )

                # Add the Category to the Pose's categories
                pose.type.add(pose_type)

                # Print each pose creation/update in terminal
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created pose "{pose.english_name}"'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Updated pose "{pose.english_name}"'))

