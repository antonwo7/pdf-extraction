import classNames from "classnames"

interface IHeading {
	title: string
	isCentered: boolean
}

export function Heading({ title, isCentered }: IHeading) {
	return (
		<section className="page-heading">
			<div className="container">
				<div className="row">
					<div className="col-sm-12">
						<h2 className={classNames('h2_title', {
							'text-center': isCentered
						})}>{title}</h2>
					</div>
				</div>
			</div>
		</section>
	)
}
