/**
 * @author mrdoob / http://mrdoob.com/
 */

interface RenderItem {
	id: any;
	object: any;
	geometry: any;
	material: any;
	program: any;
	groupOrder: number;
	renderOrder: any;
	z: number;
	group: any;
}

function painterSortStable( a: RenderItem, b: RenderItem ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.program !== b.program ) {

		return a.program.id - b.program.id;

	} else if ( a.material.id !== b.material.id ) {

		return a.material.id - b.material.id;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

function reversePainterSortStable( a: RenderItem, b: RenderItem ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.z !== b.z ) {

		return b.z - a.z;

	} else {

		return a.id - b.id;

	}

}

class WebGLRenderList {

	private renderItems: RenderItem[] = [];
	private renderItemsIndex = 0;

	public opaque: any[] = [];
	public transparent: any[] = [];

	private defaultProgram = { id: - 1 };

	public init() {

		this.renderItemsIndex = 0;

		this.opaque.length = 0;
		this.transparent.length = 0;

	}

	private getNextRenderItem(
		object: any,
		geometry: any,
		material: any,
		groupOrder: number,
		z: number,
		group: any
	) {

		var renderItem = this.renderItems[ this.renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				program: material.program || this.defaultProgram,
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group,
			};

			this.renderItems[ this.renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.program = material.program || this.defaultProgram;
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		this.renderItemsIndex ++;

		return renderItem;

	}

	public push(
		object: any,
		geometry: any,
		material: any,
		groupOrder: number,
		z: number,
		group: any
	) {

		var renderItem = this.getNextRenderItem(
			object,
			geometry,
			material,
			groupOrder,
			z,
			group
		);

		( material.transparent === true ? this.transparent : this.opaque ).push(
			renderItem
		);

	}

	public unshift(
		object: any,
		geometry: any,
		material: any,
		groupOrder: number,
		z: number,
		group: any
	) {

		var renderItem = this.getNextRenderItem(
			object,
			geometry,
			material,
			groupOrder,
			z,
			group
		);

		( material.transparent === true ? this.transparent : this.opaque ).unshift(
			renderItem
		);

	}

	public sort() {

		if ( this.opaque.length > 1 ) this.opaque.sort( painterSortStable );
		if ( this.transparent.length > 1 )
			this.transparent.sort( reversePainterSortStable );

	}

}

export class WebGLRenderLists {

	private lists: Record<string, any> = {};

	private onSceneDispose( event: any ) {

		var scene = event.target;

		scene.removeEventListener( 'dispose', this.onSceneDispose );

		delete this.lists[ scene.id ];

	}

	public get( scene: any, camera: any ) {

		var cameras = this.lists[ scene.id ];
		var list;
		if ( cameras === undefined ) {

			list = new WebGLRenderList();
			this.lists[ scene.id ] = {};
			this.lists[ scene.id ][ camera.id ] = list;

			scene.addEventListener( 'dispose', this.onSceneDispose );

		} else {

			list = cameras[ camera.id ];
			if ( list === undefined ) {

				list = new WebGLRenderList();
				cameras[ camera.id ] = list;

			}

		}

		return list;

	}

	public dispose() {

		this.lists = {};

	}

}
