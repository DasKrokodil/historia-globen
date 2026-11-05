#!/usr/bin/env python3
"""Skapar eller kontrollerar maskinläsbara licensmanifest ur projektets data."""
import json
import sys
from pathlib import Path


DATA_LICENSE = {
    'name': 'CC BY 4.0',
    'url': 'https://creativecommons.org/licenses/by/4.0/',
    'file': 'data/LICENSE',
}
OUTPUTS = ('data/licenses.json', 'images/licenses.json')


def read_json(root, relative_path):
    return json.loads((root / relative_path).read_text(encoding='utf-8'))


def required_text(record, key, context):
    value = record.get(key)
    if not isinstance(value, str) or not value:
        raise ValueError(f'{context}: {key} saknas eller är inte text')
    return value


def build_manifests(root):
    source_data = read_json(root, 'data/sources.json')
    event_data = read_json(root, 'data/events.json')
    sources_by_id = {}
    sources_by_license = {}

    for source in source_data['sources']:
        if not isinstance(source, dict):
            raise ValueError('data/sources.json: en källpost är inte ett objekt')
        source_id = required_text(source, 'id', 'data/sources.json')
        if source_id in sources_by_id:
            raise ValueError(f'data/sources.json: käll-id {source_id} förekommer flera gånger')
        record = {
            'id': source_id,
            'title': required_text(source, 'title', f'data/sources.json ({source_id})'),
            'url': required_text(source, 'url', f'data/sources.json ({source_id})'),
            'license': required_text(source, 'license', f'data/sources.json ({source_id})'),
            'checked': required_text(source, 'checked', f'data/sources.json ({source_id})'),
        }
        sources_by_id[source_id] = record
        sources_by_license.setdefault(record['license'], []).append(source_id)

    images = []
    for event in event_data['events']:
        if not isinstance(event, dict):
            raise ValueError('data/events.json: en händelse är inte ett objekt')
        image = event.get('image')
        if image is None:
            continue
        event_id = required_text(event, 'id', 'data/events.json')
        if not isinstance(image, dict):
            raise ValueError(f'data/events.json ({event_id}): image är inte ett objekt')
        source_id = image.get('source')
        if source_id is not None and source_id not in sources_by_id:
            raise ValueError(f'data/events.json ({event_id}): bildkällan {source_id} saknas i sources.json')
        images.append({
            'eventId': event_id,
            'eventTitle': event['title']['sv'],
            'file': required_text(image, 'file', f'data/events.json ({event_id}, image)'),
            'kind': required_text(image, 'kind', f'data/events.json ({event_id}, image)'),
            'credit': required_text(image, 'credit', f'data/events.json ({event_id}, image)'),
            'license': required_text(image, 'license', f'data/events.json ({event_id}, image)'),
            'source': sources_by_id[source_id] if source_id is not None else None,
        })

    data_manifest = {
        'schema': 'historia-globen/data-licenses@1',
        'projectDataLicense': DATA_LICENSE,
        'sourcesByLicense': [
            {'license': license, 'sourceIds': sorted(source_ids)}
            for license, source_ids in sorted(sources_by_license.items())
        ],
    }
    image_manifest = {
        'schema': 'historia-globen/event-image-licenses@1',
        'scope': 'data/events.json events[].image',
        'images': sorted(images, key=lambda image: image['eventId']),
    }
    return {
        OUTPUTS[0]: data_manifest,
        OUTPUTS[1]: image_manifest,
    }


def check(root):
    try:
        expected = build_manifests(root)
    except (OSError, ValueError, KeyError, TypeError) as error:
        return [f'license_manifests: kan inte skapa manifest: {error}']

    errors = []
    for relative_path, manifest in expected.items():
        path = root / relative_path
        try:
            actual = json.loads(path.read_text(encoding='utf-8'))
        except (OSError, ValueError) as error:
            errors.append(f'{relative_path}: går inte att läsa ({error})')
            continue
        if actual != manifest:
            errors.append(f'{relative_path}: stämmer inte med källorna; kör python3 tools/license_manifests.py')
    return errors


def write(root):
    for relative_path, manifest in build_manifests(root).items():
        path = root / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'{relative_path}: uppdaterad')


def main():
    root = Path(__file__).resolve().parent.parent
    if sys.argv[1:] == ['--check']:
        errors = check(root)
        if errors:
            for error in errors:
                print(error, file=sys.stderr)
            sys.exit(1)
        print('license_manifests: ok')
        return
    if sys.argv[1:]:
        print('Användning: python3 tools/license_manifests.py [--check]', file=sys.stderr)
        sys.exit(2)
    try:
        write(root)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f'license_manifests: kan inte skapa manifest: {error}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
