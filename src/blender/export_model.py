import bpy
import json

def export_mesh_data(output_file):
    # Get the active object
    obj = bpy.context.view_layer.objects.active
    if obj is None or obj.type != 'MESH':
        print("Selected object is not a mesh")
        return
    
    # Ensure the object is in object mode
    bpy.ops.object.mode_set(mode='OBJECT')

    # Get the mesh data
    mesh = obj.data
    vertices = []
    indices = []

    # Collect vertices (coordinates)
    for vertex in mesh.vertices:
        vertices.extend(vertex.co)  # Extend with x, y, z coordinates
    
    # Collect face indices (triangles)
    for poly in mesh.polygons:
        indices.extend(poly.vertices)  # Each polygon is a triangle, get its vertex indices

    # Create the output data structure
    mesh_data = {
        "vertices": vertices,
        "indices": indices
    }

    # Write data to file
    with open(output_file, 'w') as f:
        json.dump(mesh_data, f, indent=2)

    print(f"Mesh data exported to {output_file}")

# Specify the output file path
output_file = "/tmp/exported_model.json"  # Change the path if necessary
export_mesh_data(output_file)

